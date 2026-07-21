import { arraySuccessFixture } from "./array-success.ts";
import { errorsRichFixture } from "./errors-rich.ts";
import { envelopeVariantsFixture } from "./envelope-variants.ts";
import { minimalFixture } from "./minimal.ts";
import { multiResourceFixture } from "./multi-resource.ts";
import { paginationFixture } from "./pagination.ts";
import { recordJsonFixture } from "./record-json.ts";
import { renameExportFixture } from "./rename-export.ts";
import { schemaKindsFixture } from "./schema-kinds.ts";
import { unionSuccessFixture } from "./union-success.ts";
import { workosFixture } from "./workos.ts";

export const fixtures = {
  "array-success": arraySuccessFixture,
  minimal: minimalFixture,
  "schema-kinds": schemaKindsFixture,
  pagination: paginationFixture,
  "record-json": recordJsonFixture,
  "errors-rich": errorsRichFixture,
  "rename-export": renameExportFixture,
  "multi-resource": multiResourceFixture,
  "envelope-variants": envelopeVariantsFixture,
  "union-success": unionSuccessFixture,
  // The #28 exemplar's hand-built IR, kept as the richest end-to-end fixture
  // (pagination + code errors + rename-export + envelope in one tree) after the
  // vendor-backed regen gate took over the byte-pinning of clients/workos.
  "workos-exemplar": workosFixture,
} as const;
