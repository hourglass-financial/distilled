import * as Effect from "effect/Effect";
import { OrganizationsControllerCreate } from "../src/operations/OrganizationsControllerCreate.ts";
import { OrganizationsControllerDeleteOrganization } from "../src/operations/OrganizationsControllerDeleteOrganization.ts";
import { UserlandUserOrganizationMembershipsControllerCreate } from "../src/operations/UserlandUserOrganizationMembershipsControllerCreate.ts";
import { UserlandUserOrganizationMembershipsControllerDelete } from "../src/operations/UserlandUserOrganizationMembershipsControllerDelete.ts";
import { UserlandUsersControllerCreate0 } from "../src/operations/UserlandUsersControllerCreate0.ts";
import { UserlandUsersControllerDelete0 } from "../src/operations/UserlandUsersControllerDelete0.ts";
import { testRunId } from "./setup.ts";

type OrganizationMembership = Effect.Success<
  ReturnType<typeof UserlandUserOrganizationMembershipsControllerCreate>
>;

/**
 * Creates an isolated membership fixture and removes every resource afterward,
 * including when the test body fails.
 */
export const withOrganizationMembership = <A, E, R>(
  name: string,
  use: (membership: OrganizationMembership) => Effect.Effect<A, E, R>,
) =>
  Effect.gen(function* () {
    const user = yield* UserlandUsersControllerCreate0({
      email: `distilled-workos-${name}-${testRunId}@example.com`,
    });

    return yield* Effect.gen(function* () {
      const organization = yield* OrganizationsControllerCreate({
        name: `distilled-workos-${name}-${testRunId}`,
      });

      return yield* Effect.gen(function* () {
        const membership =
          yield* UserlandUserOrganizationMembershipsControllerCreate({
            user_id: user.id,
            organization_id: organization.id,
          });

        return yield* use(membership).pipe(
          Effect.ensuring(
            UserlandUserOrganizationMembershipsControllerDelete({
              id: membership.id,
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
    }).pipe(
      Effect.ensuring(
        UserlandUsersControllerDelete0({ id: user.id }).pipe(Effect.ignore),
      ),
    );
  });
