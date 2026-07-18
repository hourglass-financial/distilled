import { errorsRichFixture } from "./errors-rich.ts";
import { minimalFixture } from "./minimal.ts";
import { multiResourceFixture } from "./multi-resource.ts";
import { paginationFixture } from "./pagination.ts";
import { renameExportFixture } from "./rename-export.ts";
import { schemaKindsFixture } from "./schema-kinds.ts";

export const fixtures = {
  minimal: minimalFixture,
  "schema-kinds": schemaKindsFixture,
  pagination: paginationFixture,
  "errors-rich": errorsRichFixture,
  "rename-export": renameExportFixture,
  "multi-resource": multiResourceFixture,
} as const;
