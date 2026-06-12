#!/usr/bin/env python3
"""Mirror Erebor Fern docs from llms.txt into a local directory.

This script intentionally uses only the Python standard library. Fern's
password gate is handled by posting the shared docs password to the same
endpoint the browser uses, then reusing the returned HttpOnly cookie through a
cookie jar.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import http.cookiejar
import json
import os
import posixpath
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path


BASE_URL = "https://docs.erebor.bank"
DEFAULT_OUT_DIR = Path("docs/erebor")
DEFAULT_COOKIE_JAR = Path(".ai-workspace/erebor-docs.cookies.txt")
OPENAPI_FILES = (("openapi.yaml", "openapi.yaml"), ("openapi.json", "openapi.json"))

LINK_RE = re.compile(r"https://docs\.erebor\.bank/[^\s<>)\"']+")


@dataclass(frozen=True)
class Response:
    url: str
    status: int
    headers: object
    text: str


class DocsClient:
    def __init__(self, base_url: str, cookie_jar_path: Path, timeout: float) -> None:
        self.base_url = base_url.rstrip("/")
        self.cookie_jar_path = cookie_jar_path
        self.timeout = timeout
        self.cookie_jar = http.cookiejar.MozillaCookieJar(str(cookie_jar_path))

        if cookie_jar_path.exists():
            self.cookie_jar.load(ignore_discard=True, ignore_expires=True)

        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cookie_jar),
        )

    def get_text(self, url: str) -> Response:
        return self._request("GET", url)

    def post_json(self, url: str, payload: object) -> Response:
        data = json.dumps(payload).encode("utf-8")
        return self._request(
            "POST",
            url,
            data=data,
            headers={"Content-Type": "application/json"},
        )

    def save_cookies(self) -> None:
        self.cookie_jar_path.parent.mkdir(parents=True, exist_ok=True)
        self.cookie_jar.save(ignore_discard=True, ignore_expires=True)

    def cookie_header(self) -> str:
        cookies: list[str] = []
        for cookie in self.cookie_jar:
            if not cookie.is_expired():
                cookies.append(f"{cookie.name}={cookie.value}")
        return "; ".join(cookies)

    def _request(
        self,
        method: str,
        url: str,
        data: bytes | None = None,
        headers: dict[str, str] | None = None,
    ) -> Response:
        request = urllib.request.Request(
            url,
            data=data,
            headers={
                "User-Agent": "hourglass-erebor-docs-mirror/1.0",
                **(headers or {}),
            },
            method=method,
        )

        try:
            with self.opener.open(request, timeout=self.timeout) as response:
                body = response.read()
                charset = response.headers.get_content_charset() or "utf-8"
                return Response(
                    url=response.geturl(),
                    status=response.status,
                    headers=response.headers,
                    text=body.decode(charset, errors="replace"),
                )
        except urllib.error.HTTPError as error:
            body = error.read()
            charset = error.headers.get_content_charset() or "utf-8"
            return Response(
                url=error.geturl(),
                status=error.code,
                headers=error.headers,
                text=body.decode(charset, errors="replace"),
            )


def fetch_with_cookie_header(url: str, cookie_header: str, timeout: float) -> Response:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "hourglass-erebor-docs-mirror/1.0",
            "Cookie": cookie_header,
        },
        method="GET",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read()
            charset = response.headers.get_content_charset() or "utf-8"
            return Response(
                url=response.geturl(),
                status=response.status,
                headers=response.headers,
                text=body.decode(charset, errors="replace"),
            )
    except urllib.error.HTTPError as error:
        body = error.read()
        charset = error.headers.get_content_charset() or "utf-8"
        return Response(
            url=error.geturl(),
            status=error.code,
            headers=error.headers,
            text=body.decode(charset, errors="replace"),
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Mirror Erebor Fern docs listed in llms.txt.",
    )
    parser.add_argument("--base-url", default=BASE_URL)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument("--cookie-jar", type=Path, default=DEFAULT_COOKIE_JAR)
    parser.add_argument("--timeout", type=float, default=30.0)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument(
        "--password",
        default=os.environ.get("EREBOR_DOCS_PASSWORD"),
        help="Docs password. Defaults to EREBOR_DOCS_PASSWORD.",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--include-index",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Write llms.txt into the output directory.",
    )
    return parser.parse_args()


def ensure_authenticated(client: DocsClient, password: str | None) -> str:
    llms_url = f"{client.base_url}/llms.txt"
    response = client.get_text(llms_url)

    if response.status == 200 and response.text.strip() != "User is not logged in":
        client.save_cookies()
        return response.text

    login_url = f"{client.base_url}/api/fern-docs/auth/password"
    if not password:
        raise RuntimeError(
            "EREBOR_DOCS_PASSWORD is required when cached docs cookies are unavailable",
        )
    login_response = client.post_json(login_url, {"password": password})

    if login_response.status != 200:
        raise RuntimeError(
            f"Fern password login failed with HTTP {login_response.status}: "
            f"{login_response.text[:200]}",
        )

    try:
        login_payload = json.loads(login_response.text)
    except json.JSONDecodeError as error:
        raise RuntimeError("Fern password login returned invalid JSON") from error

    if login_payload.get("success") is not True:
        raise RuntimeError(f"Fern password login failed: {login_response.text[:200]}")

    client.save_cookies()
    response = client.get_text(llms_url)

    if response.status != 200 or response.text.strip() == "User is not logged in":
        raise RuntimeError("Fern login succeeded but llms.txt is still unavailable")

    client.save_cookies()
    return response.text


def extract_doc_urls(base_url: str, llms_text: str) -> list[str]:
    base = urllib.parse.urlparse(base_url)
    seen: set[str] = set()
    urls: list[str] = []

    for raw_url in LINK_RE.findall(llms_text):
        url = raw_url.rstrip(".,;:")
        parsed = urllib.parse.urlparse(url)

        if parsed.scheme != base.scheme or parsed.netloc != base.netloc:
            continue

        if not (parsed.path.endswith(".md") or parsed.path.endswith(".mdx")):
            continue

        normalized = urllib.parse.urlunparse(
            parsed._replace(query="", fragment=""),
        )

        if normalized in seen:
            continue

        seen.add(normalized)
        urls.append(normalized)

    return urls


def output_path_for_url(out_dir: Path, base_url: str, url: str) -> Path:
    base = urllib.parse.urlparse(base_url)
    parsed = urllib.parse.urlparse(url)

    if parsed.scheme != base.scheme or parsed.netloc != base.netloc:
        raise ValueError(f"Refusing to mirror non-base URL: {url}")

    raw_path = urllib.parse.unquote(parsed.path).lstrip("/")
    normalized = posixpath.normpath(raw_path)

    if normalized in ("", ".") or normalized.startswith("../") or normalized == "..":
        raise ValueError(f"Refusing unsafe URL path: {url}")

    return out_dir / Path(*normalized.split("/"))


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def main() -> int:
    args = parse_args()
    client = DocsClient(args.base_url, args.cookie_jar, args.timeout)

    llms_text = ensure_authenticated(client, args.password)
    doc_urls = extract_doc_urls(args.base_url, llms_text)

    print(f"Found {len(doc_urls)} .mdx docs in {args.base_url}/llms.txt", flush=True)

    if args.dry_run:
        for url in doc_urls:
            print(f"DRY RUN {url} -> {output_path_for_url(args.out, args.base_url, url)}")
        return 0

    if args.include_index:
        write_text(args.out / "llms.txt", llms_text)

    written = 0
    failed: list[tuple[str, str]] = []
    cookie_header = client.cookie_header()

    if not cookie_header:
        raise RuntimeError("No auth cookies are available after Fern password login")

    for remote_name, local_name in OPENAPI_FILES:
        url = f"{client.base_url}/{remote_name}"
        response = fetch_with_cookie_header(url, cookie_header, args.timeout)
        if response.status != 200 or response.text.strip() == "User is not logged in":
            failed.append((url, f"HTTP {response.status}"))
            continue
        write_text(args.out / local_name, response.text)
        print(f"Wrote {args.out / local_name}", flush=True)
        written += 1

    def write_response(url: str, response: Response) -> bool:
        path = output_path_for_url(args.out, args.base_url, url)

        if response.status != 200:
            failed.append((url, f"HTTP {response.status}"))
            return False

        if response.text.strip() == "User is not logged in":
            failed.append((url, "not logged in"))
            return False

        write_text(path, response.text)
        print(f"Wrote {path}", flush=True)
        return True

    if args.workers <= 1:
        for url in doc_urls:
            response = fetch_with_cookie_header(url, cookie_header, args.timeout)
            if write_response(url, response):
                written += 1
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
            futures = {
                executor.submit(
                    fetch_with_cookie_header,
                    url,
                    cookie_header,
                    args.timeout,
                ): url
                for url in doc_urls
            }

            for future in concurrent.futures.as_completed(futures):
                url = futures[future]
                try:
                    response = future.result()
                except Exception as error:
                    failed.append((url, str(error)))
                    continue

                if write_response(url, response):
                    written += 1

    client.save_cookies()

    if failed:
        print("\nFailures:", file=sys.stderr)
        for url, reason in failed:
            print(f"- {url}: {reason}", file=sys.stderr)
        return 1

    print(f"\nDone. Wrote {written} docs to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
