import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";

export interface StaticRegistryPackage {
  readonly name: string;
  readonly version: string;
  readonly manifest: Record<string, unknown>;
  readonly tarballPath: string;
  readonly integrity: string;
  readonly shasum: string;
}

export interface StaticPackageRegistry {
  readonly url: string;
  close(): Promise<void>;
}

const listen = (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

export const startStaticPackageRegistry = async (
  packages: readonly StaticRegistryPackage[],
): Promise<StaticPackageRegistry> => {
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const byTarball = new Map(
    packages.map((pkg) => [pkg.tarballPath.split("/").at(-1), pkg]),
  );

  let registryUrl = "";
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", registryUrl);
      if (request.method !== "GET") {
        response.writeHead(405).end();
        return;
      }

      if (url.pathname.startsWith("/tarballs/")) {
        const filename = decodeURIComponent(
          url.pathname.slice("/tarballs/".length),
        );
        const pkg = byTarball.get(filename);
        if (!pkg) {
          response.writeHead(404).end();
          return;
        }
        const tarball = await readFile(pkg.tarballPath);
        response.writeHead(200, {
          "content-type": "application/octet-stream",
          "content-length": tarball.byteLength,
        });
        response.end(tarball);
        return;
      }

      const name = decodeURIComponent(url.pathname.slice(1)).replace(
        "%2f",
        "/",
      );
      const pkg = byName.get(name);
      if (!pkg) {
        response.writeHead(404).end();
        return;
      }

      const filename = pkg.tarballPath.split("/").at(-1);
      const versionManifest = {
        ...pkg.manifest,
        dist: {
          tarball: `${registryUrl}/tarballs/${encodeURIComponent(filename ?? "package.tgz")}`,
          integrity: pkg.integrity,
          shasum: pkg.shasum,
        },
      };
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          name: pkg.name,
          "dist-tags": { latest: pkg.version },
          versions: { [pkg.version]: versionManifest },
        }),
      );
    } catch (error) {
      console.error(`Static registry request failed: ${request.url}`, error);
      if (!response.headersSent) response.writeHead(500);
      if (!response.writableEnded) response.end();
    }
  });

  await listen(server);
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Loopback package registry did not expose a TCP address");
  }
  registryUrl = `http://127.0.0.1:${address.port}`;

  return {
    url: registryUrl,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
};
