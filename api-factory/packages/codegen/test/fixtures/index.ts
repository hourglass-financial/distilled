import { errorsRichFixture } from "./errors-rich.ts";
import { envelopeVariantsFixture } from "./envelope-variants.ts";
import { minimalFixture } from "./minimal.ts";
import { multiResourceFixture } from "./multi-resource.ts";
import { paginationFixture } from "./pagination.ts";
import { recordJsonFixture } from "./record-json.ts";
import { renameExportFixture } from "./rename-export.ts";
import { schemaKindsFixture } from "./schema-kinds.ts";

export const fixtures = {
  minimal: minimalFixture,
  "schema-kinds": schemaKindsFixture,
  pagination: paginationFixture,
  "record-json": recordJsonFixture,
  "errors-rich": errorsRichFixture,
  "rename-export": renameExportFixture,
  "multi-resource": multiResourceFixture,
  "envelope-variants": envelopeVariantsFixture,
} as const;
