/**
 * Op-key title stamps — how a test declares which operation and lane it
 * covers (#30, decision 5).
 *
 * `liveTest`/`contractTest` append `[live:organizations.create]` /
 * `[contract:organizations.create]` to test titles; the coverage reporter
 * parses them back out of the run results to verify every `tested` manifest
 * claim was actually exercised. Titles are the one artifact that survives
 * worker aggregation intact, which is why the claim travels there.
 *
 * A harness-issued gated skip additionally carries `[gated: …]` naming the
 * missing credential or capability — the reporter's signal that an
 * unexercised claim is excused (the environment can't run it) rather than
 * stale (nothing covers it).
 */

/** The two coverage lanes. */
export type Lane = "contract" | "live";

/** One `covers` declaration: a single op key or several. */
export type Covers = string | readonly [string, ...string[]];

const STAMP_PATTERN = /\[(contract|live):([^\]\s]+)\]/g;
const GATED_PATTERN = /\[gated: ([^\]]+)\]/;

const toKeys = (covers: Covers): readonly string[] =>
  typeof covers === "string" ? [covers] : covers;

/** Render the stamp suffix for a title: `" [live:a.b] [live:c.d]"`. */
export const stampSuffix = (lane: Lane, covers: Covers): string =>
  toKeys(covers)
    .map((key) => ` [${lane}:${key}]`)
    .join("");

/** Render the gated-skip marker naming what is missing. */
export const gatedSuffix = (reason: string): string => ` [gated: ${reason}]`;

/** A stamp parsed back out of a test title. */
export interface Stamp {
  readonly lane: Lane;
  readonly key: string;
}

/** Extract every op stamp from a test's (full) name. */
export const parseStamps = (title: string): readonly Stamp[] => {
  const stamps: Stamp[] = [];
  for (const match of title.matchAll(STAMP_PATTERN)) {
    stamps.push({ lane: match[1] as Lane, key: match[2]! });
  }
  return stamps;
};

/** The gated-skip reason carried by a title, if any. */
export const parseGated = (title: string): string | undefined =>
  GATED_PATTERN.exec(title)?.[1];
