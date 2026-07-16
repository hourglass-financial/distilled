import { testRunId } from "./setup.ts";

export const PERSONA_VERSION = "2025-12-08" as const;

export const ownedName = (resource: string, scenario: string): string =>
  `distilled-persona-${resource}-${scenario}-${testRunId}`;

export const idempotencyKey = (operation: string, scenario: string): string =>
  ownedName(`idempotency-${operation}`, scenario);

export const missingId = (prefix: string): string =>
  `${prefix}_distilled_missing_${testRunId}`;

export const syntheticIdentity = {
  firstName: "Distilled",
  lastName: `Sandbox-${testRunId}`,
  emailAddress: `distilled-${testRunId}@example.invalid`,
  phoneNumber: "+12025550199",
  birthdate: "2000-01-01",
} as const;

export interface InquiryFixtureConfig {
  readonly templateId: string;
  readonly fieldName: string;
  readonly fieldValue: string;
}

export const inquiryFixtureConfig = (): InquiryFixtureConfig => {
  const templateId = process.env.PERSONA_INQUIRY_TEMPLATE_ID;
  const fieldName = process.env.PERSONA_INQUIRY_FIELD_NAME;
  if (!templateId || !fieldName) {
    throw new Error(
      "PERSONA_INQUIRY_TEMPLATE_ID and PERSONA_INQUIRY_FIELD_NAME are required for the inquiry live test",
    );
  }
  return {
    templateId,
    fieldName,
    fieldValue: ownedName("inquiry-field", "round-trip"),
  };
};
