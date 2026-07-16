import { createAnInquiry } from "../src/operations/createAnInquiry.ts";
import { listAllInquiries } from "../src/operations/listAllInquiries.ts";
import { listAllInquirySessions } from "../src/operations/listAllInquirySessions.ts";
import { listAllInquiryTemplates } from "../src/operations/listAllInquiryTemplates.ts";
import { redactAnInquiry } from "../src/operations/redactAnInquiry.ts";
import { resumeAnInquiry } from "../src/operations/resumeAnInquiry.ts";
import {
  idempotencyKey,
  inquiryFixtureConfig,
  ownedName,
  PERSONA_VERSION,
  type InquiryFixtureConfig,
} from "./fixtures.ts";
import { findOwnedResourceId, reconcileOwnedId } from "./recovery.ts";
import { runLiveEffect, SafeApiError, withCleanup } from "./safe-run.ts";
import { testRunId } from "./setup.ts";

export interface InquiryCleanupContext {
  readonly fixture: InquiryFixtureConfig;
  readonly referenceId: string;
  readonly registerCreatedId: (id: string) => void;
  readonly markTerminal: () => void;
}

export interface OwnedInquiry {
  readonly id: string;
  readonly fixture: InquiryFixtureConfig;
  readonly referenceId: string;
  readonly markTerminal: () => void;
}

export interface OwnedInquirySession extends OwnedInquiry {
  readonly sessionId: string;
}

export const templateSelector = (templateId: string) =>
  templateId.startsWith("itmpl_")
    ? { "inquiry-template-id": templateId }
    : { "template-id": templateId };

export const validateInquiryFixture =
  async (): Promise<InquiryFixtureConfig> => {
    const fixture = inquiryFixtureConfig();
    let configuredFieldType: string | undefined;
    try {
      const templates = await runLiveEffect(
        listAllInquiryTemplates({
          page: { size: 100 },
          personaVersion: PERSONA_VERSION,
        }),
      );
      const template = templates.data.find(
        (entry) => entry.id === fixture.templateId,
      );
      if (!template) {
        throw new Error("Configured Persona inquiry template was not found");
      }
      if (template.attributes?.status !== "active") {
        throw new Error("Configured Persona inquiry template is not active");
      }
      configuredFieldType = template.attributes?.["field-schemas"]?.find(
        (entry) => entry.key === fixture.fieldName,
      )?.type;
    } catch (error) {
      if (!(error instanceof SafeApiError && error._tag === "Unauthorized")) {
        throw error;
      }
      const inquiries = await runLiveEffect(
        listAllInquiries({
          filter: { "inquiry-template-id": fixture.templateId },
          page: { size: 100 },
          personaVersion: PERSONA_VERSION,
        }),
      );
      configuredFieldType = inquiries.data
        .map((inquiry) => inquiry.attributes.fields[fixture.fieldName]?.type)
        .find((type) => typeof type === "string");
    }
    if (!/string/i.test(configuredFieldType ?? "")) {
      throw new Error(
        "Configured Persona inquiry field was not observed as a string field",
      );
    }
    return fixture;
  };

export const withInquiryCleanup = async <A>(
  scenario: string,
  body: (context: InquiryCleanupContext) => Promise<A>,
): Promise<A> => {
  const fixture = await validateInquiryFixture();
  return withCleanup(async (cleanup) => {
    const referenceId = ownedName("inquiry", scenario);
    const locator = { kind: "inquiry" as const, value: referenceId };
    let inquiryId: string | undefined;
    let terminal = false;

    cleanup.add(`inquiry ${referenceId}`, async () => {
      if (terminal) return;
      const recovered = inquiryId
        ? { id: inquiryId }
        : await reconcileOwnedId(locator, (candidate) =>
            findOwnedResourceId(candidate, testRunId),
          );
      if (!recovered) return;
      try {
        await runLiveEffect(
          redactAnInquiry({
            inquiryId: recovered.id,
            idempotencyKey: idempotencyKey("redact-inquiry", scenario),
            personaVersion: PERSONA_VERSION,
          }),
        );
      } catch (error) {
        if (!(error instanceof SafeApiError && error._tag === "NotFound")) {
          throw error;
        }
      }
    });

    return body({
      fixture,
      referenceId,
      registerCreatedId: (createdId) => {
        inquiryId = createdId;
      },
      markTerminal: () => {
        terminal = true;
      },
    });
  });
};

export const withOwnedInquiry = async <A>(
  scenario: string,
  body: (inquiry: OwnedInquiry) => Promise<A>,
): Promise<A> =>
  withInquiryCleanup(scenario, async (context) => {
    const created = await runLiveEffect(
      createAnInquiry({
        idempotencyKey: idempotencyKey("create-inquiry", scenario),
        personaVersion: PERSONA_VERSION,
        data: {
          attributes: {
            ...templateSelector(context.fixture.templateId),
            "reference-id": context.referenceId,
            note: context.referenceId,
            fields: {
              [context.fixture.fieldName]: context.fixture.fieldValue,
            },
          },
        },
        meta: { "auto-create-account": false },
      }),
    );
    context.registerCreatedId(created.data.id);
    return body({
      id: created.data.id,
      fixture: context.fixture,
      referenceId: context.referenceId,
      markTerminal: context.markTerminal,
    });
  });

export const withOwnedInquirySession = async <A>(
  scenario: string,
  body: (session: OwnedInquirySession) => Promise<A>,
): Promise<A> =>
  withOwnedInquiry(scenario, async (inquiry) => {
    await runLiveEffect(
      resumeAnInquiry({
        inquiryId: inquiry.id,
        idempotencyKey: idempotencyKey("resume-inquiry", scenario),
        personaVersion: PERSONA_VERSION,
      }),
    );
    const sessions = await runLiveEffect(
      listAllInquirySessions({
        filter: { "inquiry-id": inquiry.id },
        personaVersion: PERSONA_VERSION,
      }),
    );
    const sessionId = sessions.data[0]?.id;
    if (!sessionId) {
      throw new Error(
        "Persona did not create an inquiry session while resuming an inquiry",
      );
    }
    return body({ ...inquiry, sessionId });
  });
