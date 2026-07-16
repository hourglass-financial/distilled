import { CredentialsFromEnv } from "@hourglass-financial/persona/Credentials";
import { PersonaParseError } from "@hourglass-financial/persona/Errors";
import {
  RetrieveAnInquiryOutput,
  retrieveAnInquiry,
} from "@hourglass-financial/persona/Operations";

const operation = retrieveAnInquiry({
  inquiryId: "inq_compatibility_fixture",
});
if (
  !CredentialsFromEnv ||
  !PersonaParseError ||
  !RetrieveAnInquiryOutput ||
  !operation
) {
  throw new Error("Persona compatibility subpath import is incomplete");
}
