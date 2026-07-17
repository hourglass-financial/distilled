import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { AuthorizationResourcesControllerCreate } from "../src/operations/AuthorizationResourcesControllerCreate.ts";
import { AuthorizationResourcesControllerDelete } from "../src/operations/AuthorizationResourcesControllerDelete.ts";
import { OrganizationsControllerCreate } from "../src/operations/OrganizationsControllerCreate.ts";
import { OrganizationsControllerDeleteOrganization } from "../src/operations/OrganizationsControllerDeleteOrganization.ts";
import { runEffect, runOrSkipOnEnvLimitation, testRunId } from "./setup.ts";

const resourceInput = (suffix: string) => ({
  external_id: `distilled-${suffix}-${testRunId}`,
  name: `Distilled ${suffix} ${testRunId}`,
  resource_type_slug: "workspace",
  organization_id: `org_does_not_exist_${testRunId}`,
});

describe("AuthorizationResourcesControllerCreate", () => {
  it("fails with BadRequest when the request body is malformed", async () => {
    const error = await runEffect(
      AuthorizationResourcesControllerCreate({
        external_id: "",
        name: "",
        resource_type_slug: "",
        organization_id: "",
      }).pipe(Effect.flip),
    );

    expect(["BadRequest", "UnprocessableEntity"]).toContain(error._tag);
  }, 30_000);

  it("fails with NotFound when the referenced organization or parent does not exist", async () => {
    const error = await runEffect(
      AuthorizationResourcesControllerCreate(
        resourceInput("missing-organization"),
      ).pipe(Effect.flip),
    );

    expect(["NotFound", "UnprocessableEntity"]).toContain(error._tag);
  }, 30_000);

  it("conceals an organization outside this tenant", async () => {
    const error = await runEffect(
      AuthorizationResourcesControllerCreate({
        ...resourceInput("foreign-organization"),
        organization_id: "org_01HFGZ6QYV0000000000000000",
      }).pipe(Effect.flip),
    );

    expect(["Forbidden", "NotFound"]).toContain(error._tag);
  }, 30_000);

  it("fails with Conflict when creating a resource that already exists", async (ctx) => {
    const externalId = `distilled-duplicate-resource-${testRunId}`;
    const error = await runOrSkipOnEnvLimitation(
      ctx,
      Effect.gen(function* () {
        const organization = yield* OrganizationsControllerCreate({
          name: `distilled-resource-conflict-${testRunId}`,
        });
        return yield* Effect.gen(function* () {
          const resource = yield* AuthorizationResourcesControllerCreate({
            external_id: externalId,
            name: `Distilled duplicate ${testRunId}`,
            resource_type_slug: "workspace",
            organization_id: organization.id,
          });
          return yield* AuthorizationResourcesControllerCreate({
            external_id: externalId,
            name: `Distilled duplicate ${testRunId}`,
            resource_type_slug: "workspace",
            organization_id: organization.id,
          }).pipe(
            Effect.flip,
            Effect.ensuring(
              AuthorizationResourcesControllerDelete({
                resource_id: resource.id,
              }).pipe(Effect.ignore),
            ),
          );
        }).pipe(
          Effect.ensuring(
            OrganizationsControllerDeleteOrganization({
              id: organization.id,
            }).pipe(Effect.ignore),
          ),
        );
      }),
    );

    expect(["Conflict", "UnprocessableEntity"]).toContain(error._tag);
  }, 30_000);

  it("fails with NotFound when the resource type slug is invalid", async () => {
    const error = await runEffect(
      Effect.gen(function* () {
        const organization = yield* OrganizationsControllerCreate({
          name: `distilled-resource-invalid-type-${testRunId}`,
        });
        return yield* AuthorizationResourcesControllerCreate({
          external_id: `distilled-invalid-type-${testRunId}`,
          name: `Distilled invalid type ${testRunId}`,
          resource_type_slug: `not-a-real-type-${testRunId}`,
          organization_id: organization.id,
        }).pipe(
          Effect.flip,
          Effect.ensuring(
            OrganizationsControllerDeleteOrganization({
              id: organization.id,
            }).pipe(Effect.ignore),
          ),
        );
      }),
    );

    expect(error._tag).toBe("NotFound");
  }, 30_000);
});
