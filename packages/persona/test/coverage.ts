export type CoverageStatus =
  | "live-lifecycle"
  | "live-data"
  | "live-envelope"
  | "error-only"
  | "fixture-dependent"
  | "environment-dependent"
  | "infeasible";

export const operationCoverage = {
  listAllAccounts: "live-data",
  createAnAccount: "live-lifecycle",
  searchAccounts: "live-data",
  listAllApiKeys: "environment-dependent",
  createAnApiKey: "environment-dependent",
  listAllConnectConnections: "environment-dependent",
  createAConnectConnection: "environment-dependent",
  listAllShareTokens: "environment-dependent",
  createAShareToken: "environment-dependent",
  listAllApiLogs: "live-data",
  listAllCases: "live-data",
  createACase: "fixture-dependent",
  searchCases: "fixture-dependent",
  listAllDevices: "live-envelope",
  listAllEvents: "live-data",
  createAGraphQuery: "fixture-dependent",
  listAllImporters: "live-envelope",
  importAnAccount: "environment-dependent",
  importEmailAddressLists: "environment-dependent",
  importGeolocationLists: "environment-dependent",
  importGovernmentIdNumberLists: "environment-dependent",
  importIpAddressLists: "environment-dependent",
  importNameLists: "environment-dependent",
  importPhoneNumberLists: "environment-dependent",
  listAllInquiries: "live-data",
  createAnInquiry: "live-lifecycle",
  searchInquiries: "live-data",
  listAllInquirySessions: "live-data",
  createAnInquirySession: "live-lifecycle",
  expireInquirySessions: "live-lifecycle",
  listAllInquiryTemplates: "environment-dependent",
  createABrowserFingerprintListItem: "infeasible",
  createACountryListItem: "environment-dependent",
  createADeviceFingerprintListItem: "infeasible",
  createAnEmailAddressListItem: "environment-dependent",
  createAFieldListItem: "environment-dependent",
  createAGeolocationListItem: "environment-dependent",
  createAGovernmentIdNumberListItem: "environment-dependent",
  createAnIpAddressListItem: "environment-dependent",
  createANameListItem: "environment-dependent",
  createAPhoneNumberListItem: "environment-dependent",
  createAStringListItem: "environment-dependent",
  createABrowserFingerprintList: "infeasible",
  createACountryList: "environment-dependent",
  createAnEmailAddressList: "environment-dependent",
  createAGeolocationList: "environment-dependent",
  createAGovernmentIdNumberList: "environment-dependent",
  createAnIpAddressList: "environment-dependent",
  createANameList: "environment-dependent",
  createAPhoneNumberList: "environment-dependent",
  createAStringsList: "environment-dependent",
  listAllLists: "live-data",
  createAuthorization: "environment-dependent",
  createAccessToken: "environment-dependent",
  createAPrivacyPass: "environment-dependent",
  listAllRateLimits: "live-data",
  createARelay: "environment-dependent",
  requestARelayChallenge: "environment-dependent",
  listAllReports: "live-data",
  createAReport: "fixture-dependent",
  listAllTransactions: "live-envelope",
  createATransaction: "fixture-dependent",
  listAllUserAuditLogs: "environment-dependent",
  listAllWebhooks: "live-data",
  createAWebhook: "environment-dependent",
  listAllWorkflowRuns: "live-data",
  retrieveAnAccountType: "fixture-dependent",
  retrieveAnAccount: "live-data",
  updateAnAccount: "live-lifecycle",
  redactAnAccount: "live-lifecycle",
  accountsAddRelation: "fixture-dependent",
  accountsAddTag: "live-lifecycle",
  consolidateIntoAnAccount: "live-lifecycle",
  accountsListAllRelations: "fixture-dependent",
  accountsRemoveRelation: "fixture-dependent",
  accountsRemoveTag: "live-lifecycle",
  accountsSetAllTags: "live-lifecycle",
  runAccountAction: "fixture-dependent",
  retrieveAnApiKey: "environment-dependent",
  updateAnApiKey: "environment-dependent",
  expireAnApiKey: "environment-dependent",
  cloneApiKey: "environment-dependent",
  retrieveAConnectConnection: "environment-dependent",
  deactivateAConnectConnection: "environment-dependent",
  reactivateAConnectConnection: "environment-dependent",
  retrieveAShareToken: "environment-dependent",
  expireShareToken: "environment-dependent",
  redeemShareToken: "environment-dependent",
  retrieveAnApiLog: "live-data",
  retrieveACaseTemplate: "fixture-dependent",
  retrieveCase: "live-data",
  updateACase: "fixture-dependent",
  redactACase: "fixture-dependent",
  addPersonaObjects: "fixture-dependent",
  removePersonaObjects: "fixture-dependent",
  assignACase: "fixture-dependent",
  setStatusForACase: "fixture-dependent",
  addTag: "fixture-dependent",
  removeTag: "fixture-dependent",
  setTags: "fixture-dependent",
  retrieveADevice: "error-only",
  retrieveAGenericDocument: "fixture-dependent",
  retrieveAGovernmentIdDocument: "fixture-dependent",
  retrieveADocument: "fixture-dependent",
  retrieveAnEvent: "live-data",
  retrieveAGraphQuery: "fixture-dependent",
  retrieveAnImporter: "fixture-dependent",
  retrieveAnInquiry: "live-data",
  updateAnInquiry: "live-lifecycle",
  redactAnInquiry: "live-lifecycle",
  inquiriesAddTag: "live-lifecycle",
  approveAnInquiry: "live-lifecycle",
  declineAnInquiry: "live-lifecycle",
  markAnInquiryForReview: "live-lifecycle",
  expireAnInquiry: "live-lifecycle",
  generateAOneTimeLink: "live-lifecycle",
  printAnInquiryPdf: "infeasible",
  inquiriesRemoveTag: "live-lifecycle",
  resumeAnInquiry: "live-lifecycle",
  inquiriesSetAllTags: "live-lifecycle",
  inquiriesPerformSimulateActions: "live-lifecycle",
  retrieveAnInquirySession: "live-data",
  expireAnInquirySession: "live-lifecycle",
  generateAOneTimeLinkForAnInquirySession: "live-lifecycle",
  retrieveAnInquiryTemplate: "fixture-dependent",
  retrieveInquiryTemplateTranslations: "fixture-dependent",
  importInquiryTemplateTranslations: "fixture-dependent",
  retrieveABrowserFingerprintListItem: "infeasible",
  archiveABrowserFingerprintListItem: "infeasible",
  retrieveACountryListItem: "environment-dependent",
  archiveACountryListItem: "environment-dependent",
  retrieveADeviceFingerprintListItem: "infeasible",
  archiveADeviceFingerprintListItem: "infeasible",
  retrieveAnEmailAddressListItem: "environment-dependent",
  archiveAnEmailAddressListItem: "environment-dependent",
  retrieveAFieldListItem: "environment-dependent",
  archiveAFieldListItem: "environment-dependent",
  retrieveAGeolocationListItem: "environment-dependent",
  archiveAGeolocationListItem: "environment-dependent",
  retrieveAGovernmentIdNumberListItem: "environment-dependent",
  archiveAGovernmentIdNumberListItem: "environment-dependent",
  retrieveAnIpAddressListItem: "environment-dependent",
  archiveAnIpAddressListItem: "environment-dependent",
  retrieveANameListItem: "environment-dependent",
  archiveANameListItem: "environment-dependent",
  retrieveAPhoneNumberListItem: "environment-dependent",
  archiveAPhoneNumberListItem: "environment-dependent",
  retrieveAStringListItem: "error-only",
  archiveAStringListItem: "environment-dependent",
  retrieveAList: "error-only",
  archiveAList: "environment-dependent",
  generateARelayClaim: "environment-dependent",
  retrieveAReport: "live-data",
  redactAReport: "fixture-dependent",
  reportsAddTag: "fixture-dependent",
  dismissMatches: "fixture-dependent",
  listReportHistory: "fixture-dependent",
  reportActionPauseContinuousMonitoring: "fixture-dependent",
  printReportPdf: "infeasible",
  reportsRemoveTag: "fixture-dependent",
  reportActionResumeContinuousMonitoring: "fixture-dependent",
  reportActionReRunReport: "fixture-dependent",
  reportsSetAllTags: "fixture-dependent",
  retrieveATransaction: "fixture-dependent",
  updateATransaction: "fixture-dependent",
  redactATransaction: "fixture-dependent",
  transactionsAddRelation: "fixture-dependent",
  transactionsAddTag: "fixture-dependent",
  createATransactionLabel: "fixture-dependent",
  transactionsRemoveRelation: "fixture-dependent",
  transactionsRemoveTag: "fixture-dependent",
  transactionsSetTags: "fixture-dependent",
  redactTransactionBiometrics: "fixture-dependent",
  retrieveATransactionType: "fixture-dependent",
  retrieveAUserAuditLog: "environment-dependent",
  retrieveAnAamvaVerification: "fixture-dependent",
  retrieveAnEcbsvDatabaseVerification: "fixture-dependent",
  retrieveAPhoneCarrierDatabaseVerification: "fixture-dependent",
  retrieveASerproDatabaseVerification: "fixture-dependent",
  retrieveADatabaseStandardVerification: "fixture-dependent",
  retrieveATinDatabaseVerification: "fixture-dependent",
  retrieveADatabaseVerification: "fixture-dependent",
  retrieveADocumentVerification: "fixture-dependent",
  retrieveAEmailAddressVerification: "fixture-dependent",
  retrieveAGovernmentIdVerification: "fixture-dependent",
  retrieveAGovernmentIdNfcVerification: "fixture-dependent",
  retrieveAPhoneNumberVerification: "fixture-dependent",
  retrieveASelfieVerification: "fixture-dependent",
  retrieveAVerification: "fixture-dependent",
  redactAVerification: "fixture-dependent",
  printAVerificationAsPdf: "infeasible",
  retrieveAWebhook: "live-data",
  updateAWebhook: "environment-dependent",
  archiveAWebhook: "environment-dependent",
  enableAWebhook: "environment-dependent",
  disableAWebhook: "environment-dependent",
  rotateAWebhookSecret: "environment-dependent",
  cloneAWebhook: "environment-dependent",
  createAWorkflowRun: "fixture-dependent",
  retrieveAWorkflowRun: "live-data",
} as const satisfies Record<string, CoverageStatus>;

export type PersonaOperationName = keyof typeof operationCoverage;
export const operationNames = Object.keys(
  operationCoverage,
) as PersonaOperationName[];

export interface CoverageEvidence {
  readonly kind: "documentation" | "sandbox-observation";
  readonly source: string;
  readonly prerequisite: string;
  readonly lastVerified: string;
  readonly promotionCondition: string;
  readonly httpStatus?: number;
  readonly errorTag?: string;
}

export interface CoverageEntry {
  readonly status: CoverageStatus;
  readonly evidence?: CoverageEvidence;
}

const liveStatuses = new Set<CoverageStatus>([
  "live-lifecycle",
  "live-data",
  "live-envelope",
]);

const observedFailures: Partial<
  Record<
    PersonaOperationName,
    Pick<CoverageEvidence, "httpStatus" | "errorTag">
  >
> = {
  listAllApiKeys: { httpStatus: 403, errorTag: "Forbidden" },
  listAllConnectConnections: { httpStatus: 403, errorTag: "Forbidden" },
  listAllShareTokens: { httpStatus: 403, errorTag: "Forbidden" },
  listAllInquiryTemplates: { httpStatus: 401, errorTag: "Unauthorized" },
  createAStringsList: { httpStatus: 401, errorTag: "Unauthorized" },
  listAllUserAuditLogs: { httpStatus: 401, errorTag: "Unauthorized" },
  retrieveAList: { httpStatus: 404, errorTag: "NotFound" },
  retrieveAStringListItem: { httpStatus: 404, errorTag: "NotFound" },
  retrieveADevice: { httpStatus: 404, errorTag: "NotFound" },
};

const evidenceFor = (
  operation: PersonaOperationName,
  status: CoverageStatus,
): CoverageEvidence | undefined => {
  if (liveStatuses.has(status)) return undefined;
  const observation = observedFailures[operation];

  if (status === "error-only") {
    return {
      kind: "sandbox-observation",
      source: "Authenticated operation-level error scenario",
      prerequisite: "A safe sandbox fixture that permits a successful response",
      lastVerified: "2026-07-16",
      promotionCondition:
        "Add a successful response decode while retaining the typed error assertion",
      ...observation,
    };
  }
  if (observation) {
    return {
      kind: "sandbox-observation",
      source: "Shared Persona sandbox capability census",
      prerequisite:
        status === "environment-dependent"
          ? "A sandbox credential authorized for this operation"
          : "A corrected Persona response contract and regenerated operation",
      lastVerified: "2026-07-16",
      promotionCondition:
        status === "environment-dependent"
          ? "Grant the shared credential access and add a successful operation test"
          : "Patch the provider specification, regenerate, and make the live response decode",
      ...observation,
    };
  }
  if (status === "fixture-dependent") {
    return {
      kind: "documentation",
      source: "Persona 2025-12-08 OpenAPI operation contract",
      prerequisite:
        "A stable organization-owned template, configured resource, or completed upstream workflow",
      lastVerified: "2026-07-16",
      promotionCondition:
        "Add an owned or read-only sandbox fixture and assert a successful response decode",
    };
  }
  if (status === "environment-dependent") {
    return {
      kind: "documentation",
      source: "Persona 2025-12-08 OpenAPI operation contract",
      prerequisite:
        "An isolated sandbox entitlement, connection, or secret-safe fixture",
      lastVerified: "2026-07-16",
      promotionCondition:
        "Provide the prerequisite and add a reversible successful scenario",
    };
  }
  if (status === "infeasible") {
    return {
      kind: "documentation",
      source: "Persona 2025-12-08 OpenAPI operation contract",
      prerequisite:
        "Browser, binary rendering, or irreversible user-completed automation",
      lastVerified: "2026-07-16",
      promotionCondition:
        "Add a stable automation surface with safe ownership and cleanup",
    };
  }
  throw new Error(`Missing coverage evidence for ${operation}`);
};

export const coverageInventory: Readonly<
  Record<PersonaOperationName, CoverageEntry>
> = Object.fromEntries(
  operationNames.map((operation) => {
    const status = operationCoverage[operation];
    return [operation, { status, evidence: evidenceFor(operation, status) }];
  }),
) as Record<PersonaOperationName, CoverageEntry>;
