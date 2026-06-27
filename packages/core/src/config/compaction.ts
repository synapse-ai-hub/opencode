export * as ConfigCompaction from "./compaction"

import { Schema } from "effect"
import { NonNegativeInt } from "../schema"

export class Keep extends Schema.Class<Keep>("ConfigV2.Compaction.Keep")({
  tokens: NonNegativeInt.pipe(Schema.optional),
}) {}

const Strategy = Schema.Literals(["ask", "cod", "original"])

export class Info extends Schema.Class<Info>("ConfigV2.Compaction")({
  auto: Schema.Boolean.pipe(Schema.optional),
  prune: Schema.Boolean.pipe(Schema.optional),
  keep: Keep.pipe(Schema.optional),
  buffer: NonNegativeInt.pipe(Schema.optional),
  triggerThreshold: Schema.optional(Schema.Finite).annotate({
    description:
      "Fraction of context window that triggers compaction (e.g. 0.8 = 80%). Overrides the buffer logic.",
  }),
  strategy: Schema.optional(Strategy).annotate({
    description:
      'Compaction strategy: "ask", "cod", or "original".',
  }),
  options: Schema.optional(Schema.mutable(Schema.Array(Schema.String))).annotate({
    description:
      'Available user options when strategy is "ask".',
  }),
}) {}
export type Strategy = Schema.Schema.Type<typeof Strategy>
