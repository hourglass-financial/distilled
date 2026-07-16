import { CredentialsFromEnv } from "@hourglass-financial/erebor/Credentials";
import { EreborValidationError } from "@hourglass-financial/erebor/Errors";
import {
  ListProgramsOutput,
  listPrograms,
} from "@hourglass-financial/erebor/Operations";

const operation = listPrograms({ page_size: 1 });
if (
  !CredentialsFromEnv ||
  !EreborValidationError ||
  !ListProgramsOutput ||
  !operation
) {
  throw new Error("Erebor compatibility subpath import is incomplete");
}
