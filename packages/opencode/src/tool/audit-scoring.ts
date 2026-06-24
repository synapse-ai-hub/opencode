import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import { Question } from "../question"
import { SessionID } from "../session/schema"
import path from "path"

const Dimensions = [
  { key: "contract_compliance", label: "Contract Compliance" },
  { key: "logic_fidelity", label: "Logic Fidelity" },
  { key: "completeness", label: "Completeness" },
  { key: "clarity", label: "Clarity" },
  { key: "error_handling", label: "Error Handling" },
] as const

export const Parameters = Schema.Struct({
  audit_file: Schema.String,
  scores: Schema.Struct({
    contract_compliance: Schema.Struct({ score: Schema.Number, reason: Schema.String }),
    logic_fidelity: Schema.Struct({ score: Schema.Number, reason: Schema.String }),
    completeness: Schema.Struct({ score: Schema.Number, reason: Schema.String }),
    clarity: Schema.Struct({ score: Schema.Number, reason: Schema.String }),
    error_handling: Schema.Struct({ score: Schema.Number, reason: Schema.String }),
  }),
})

type Metadata = {
  answers: ReadonlyArray<readonly string[]>
}

export const AuditScoringTool = Tool.define<
  typeof Parameters,
  Metadata,
  Question.Service
>(
  "audit_scoring",
  Effect.gen(function* () {
    const question = yield* Question.Service

    return {
      description:
        "Show a scoring UI for auditing LLM responses. Call this for EACH file being audited, one at a time.",
      parameters: Parameters,
      execute: (
        params: Schema.Schema.Type<typeof Parameters>,
        ctx: Tool.Context<Metadata>,
      ) =>
        Effect.gen(function* () {
          const questions = Dimensions.map((dim) => {
            const score = params.scores[dim.key as keyof typeof params.scores]
            return {
              header: dim.label,
              question: [
                `## ${params.audit_file}`,
                "",
                `### ${dim.label}`,
                `LLM Score: ${score.score}/5`,
                `Reason: ${score.reason}`,
                "",
                "Escribí tu puntaje (1-5) y comentarios:",
              ].join("\n"),
            }
          })

          const answers = yield* question.ask({
            sessionID: ctx.sessionID,
            questions,
          })

          // Save to markdown
          const auditDir = path.join(".synapseAgents", "llm_audit")
          const filename = `audit_${params.audit_file.replace(/[^a-zA-Z0-9]/g, "_")}.md`
          const content = [
            `# Audit: ${params.audit_file}`,
            "",
            ...Dimensions.map((dim, i) => {
              const score = params.scores[dim.key as keyof typeof params.scores]
              const humanAnswer = answers[i]?.join(", ") || ""
              return [
                `## ${dim.label}`,
                `- LLM Score: ${score.score}/5`,
                `- LLM Reason: ${score.reason}`,
                `- Human Feedback: ${humanAnswer}`,
              ].join("\n")
            }),
            "",
            `_Audited at: ${new Date().toISOString()}_`,
          ].join("\n")

          yield* Effect.tryPromise(() =>
            import("fs").then((fs) =>
              fs.promises
                .mkdir(auditDir, { recursive: true })
                .then(() => fs.promises.writeFile(path.join(auditDir, filename), content, "utf8")),
            ),
          )

          return {
            title: `Audited: ${params.audit_file}`,
            output: [
              "Audit scores submitted and saved.",
              `File: ${params.audit_file}`,
              ...Dimensions.map(
                (dim, i) => `${dim.label}: ${answers[i]?.join(", ") || "no response"}`,
              ),
            ].join("\n"),
            metadata: { answers },
          }
        }).pipe(Effect.orDie),
    }
  }),
)
