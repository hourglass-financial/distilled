#!/usr/bin/env bun
/**
 * End-to-end Smithers pipeline for creating a new SDK package.
 *
 * Chains the four stages in order:
 *   1. create-sdk          — scaffolds the package + initial generator
 *   2. error-discovery     — triggers real API errors and patches the SDK
 *   3. generate-tests      — writes happy-path + error tests
 *   4. generate-nuke       — writes the resource cleanup script
 *
 * Usage:
 *   bun scripts/create-sdk-full.ts <name> --specs <url-or-repo>... [flags]
 */

import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Console, Effect } from "effect";
import * as Path from "effect/Path";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { BOLD, GREEN, RESET } from "./lib/console.ts";
import {
  assertSmithersFinalReport,
  runSmithersWorkflow,
} from "./lib/smithers.ts";

const createSdkFull = Command.make(
  "create-sdk-full",
  {
    name: Argument.string("name").pipe(
      Argument.withDescription("SDK package name (e.g. stripe, neon, fly-io)"),
    ),
    specs: Flag.string("specs").pipe(
      Flag.withDescription(
        "Spec source (git repo URL or HTTP URL to fetch). Can be repeated.",
      ),
      Flag.atLeast(0),
    ),
    registerPackage: Flag.boolean("register-package").pipe(
      Flag.withDefault(false),
      Flag.withDescription(
        "Publish a 0.0.0 placeholder to npm as @distilled.cloud/<name>",
      ),
    ),
    note: Flag.string("note").pipe(
      Flag.withDefault(""),
      Flag.withDescription(
        "Free-form guidance forwarded to every pipeline stage via metadata.json.",
      ),
    ),
    referencePackage: Flag.string("reference-package").pipe(
      Flag.withDefault(""),
      Flag.withDescription(
        "Existing SDK package to use as a deterministic reference for patches and refinement context (e.g. erebor).",
      ),
    ),
    liveSmoke: Flag.boolean("live-smoke").pipe(
      Flag.withDefault(false),
      Flag.withDescription(
        "Run an optional read-only live smoke after create/refinement. Requires the package credential env vars.",
      ),
    ),
    skipCreate: Flag.boolean("skip-create").pipe(
      Flag.withDefault(false),
      Flag.withDescription("Skip the create-sdk stage"),
    ),
    skipErrorDiscovery: Flag.boolean("skip-error-discovery").pipe(
      Flag.withDefault(false),
      Flag.withDescription("Skip the error-discovery stage"),
    ),
    skipTests: Flag.boolean("skip-tests").pipe(
      Flag.withDefault(false),
      Flag.withDescription("Skip the generate-tests stage"),
    ),
    skipNuke: Flag.boolean("skip-nuke").pipe(
      Flag.withDefault(false),
      Flag.withDescription("Skip the generate-nuke stage"),
    ),
    continueOnError: Flag.boolean("continue-on-error").pipe(
      Flag.withDefault(false),
      Flag.withDescription("Keep running later stages even if one fails"),
    ),
  },
  (config) =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const root = path.resolve(import.meta.dir, "..");
      const note = config.note.trim();

      yield* Console.log(
        `\n${BOLD}Pipeline: create full SDK @distilled.cloud/${config.name}${RESET}`,
      );

      yield* runSmithersWorkflow(
        "sdk-create-full",
        {
          name: config.name,
          specs: Array.from(config.specs),
          registerPackage: config.registerPackage,
          note,
          referencePackage: config.referencePackage.trim() || undefined,
          liveSmoke: config.liveSmoke,
          skipCreate: config.skipCreate,
          skipErrorDiscovery: config.skipErrorDiscovery,
          skipTests: config.skipTests,
          skipNuke: config.skipNuke,
          continueOnError: config.continueOnError,
        },
        root,
      );
      yield* assertSmithersFinalReport(root, "sdk-create-full", config.name);

      yield* Console.log(
        `\n${GREEN}${BOLD}Pipeline complete for @distilled.cloud/${config.name}${RESET}`,
      );
    }),
).pipe(
  Command.withDescription(
    "Run the full new-SDK Smithers pipeline: scaffold, discover errors, write tests, generate nuke",
  ),
  Command.withExamples([
    {
      command:
        "bun scripts/create-sdk-full.ts stripe --specs https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
      description: "Full pipeline from an OpenAPI URL",
    },
    {
      command:
        "bun scripts/create-sdk-full.ts axiom-query --specs https://github.com/axiomhq/docs.git --note 'The API spec lives at restapi/versions/<version>/ inside the submodule. This SDK should cover the query service only — ignore ingest, dashboards, etc.'",
      description:
        "Nudge the workflow when one repo contains many services or the spec is in a subdirectory",
    },
    {
      command:
        "bun scripts/create-sdk-full.ts stripe --skip-create --skip-nuke",
      description:
        "Re-run only error-discovery and generate-tests for an existing SDK",
    },
  ]),
);

const program = Command.run(createSdkFull, { version: "1.0.0" });
BunRuntime.runMain(Effect.provide(program, BunServices.layer));
