// Handles post-processing for llm-auditor agent outputs.
// When the llm-auditor produces structured audit JSON, this module
// creates TUI questions to collect human feedback and saves results.
//
// This replaces the "question tool in prompt" approach with code.

import { Effect, Schema } from "effect"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { Question } from "../question"
import { Session } from "../session/session"
import { MessageID, PartID, SessionID } from "../session/schema"
import { Config } from "@/config/config"
import path from "path"

const AuditScore = Schema.Struct({
  score: Schema.Number,
  reason: Schema.String,
})

const AuditFileOutput = Schema.Struct({
  audit_file: Schema.String,
  scores: Schema.Struct({
    contract_compliance: AuditScore,
    logic_fidelity: AuditScore,
    completeness: AuditScore,
    clarity: AuditScore,
    error_handling: AuditScore,
  }),
})

const dimensions = [
  { key: "contract_compliance", label: "Contract Compliance" },
  { key: "logic_fidelity", label: "Logic Fidelity" },
  { key: "completeness", label: "Completeness" },
  { key: "clarity", label: "Clarity" },
  { key: "error_handling", label: "Error Handling" },
]

/**
 * Process an llm-auditor output message.
 * If the output contains audit JSON, show TUI question and save results.
 */
export const processAuditOutput = Effect.fn("AuditorHandler.process")(function* (
  assistantMsg: { info: SessionV1.Assistant; parts: SessionV1.Part[] },
  sessionID: SessionID,
) {
  // Only process llm-auditor agent outputs
  if (assistantMsg.info.agent !== "llm-auditor") return
  const textPart = assistantMsg.parts.findLast(
    (p): p is SessionV1.TextPart => p.type === "text",
  )
  if (!textPart) return

  // Try to parse audit JSON from the output
  let auditData: unknown
  try {
    auditData = JSON.parse(textPart.text)
  } catch {
    return // Not JSON, skip
  }

  const decoded = Schema.decodeUnknownOption(AuditFileOutput)(auditData)
  if (decoded._tag === "None") return

  const audit = decoded.value
  const session = yield* Session.Service

  // Create TUI question for this file's scores
  const questions = dimensions.map((dim) => {
    const score = audit.scores[dim.key as keyof typeof audit.scores]
    return {
      header: dim.label,
      question: `## ${audit.audit_file}\n\n### ${dim.label}\nLLM Score: ${score.score}/5\nReason: ${score.reason}\n\nEscribí tu puntaje (1-5) y comentarios:`,
    }
  })

  const questionSvc = yield* Question.Service
  const answers = yield* questionSvc.ask({
    sessionID,
    questions,
  })

  // Save to markdown
  const cfg = yield* Config.Service
  const auditDir = path.join(".synapseAgents", "llm_audit")
  const filename = `audit_${audit.audit_file.replace(/[^a-zA-Z0-9]/g, "_")}.md`
  const content = [
    `# Audit: ${audit.audit_file}`,
    "",
    ...dimensions.map((dim, i) => {
      const score = audit.scores[dim.key as keyof typeof audit.scores]
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
      fs.promises.mkdir(path.join(cfg.project ?? ".", auditDir), { recursive: true }).then(() =>
        fs.promises.writeFile(
          path.join(cfg.project ?? ".", auditDir, filename),
          content,
          "utf8",
        ),
      ),
    ),
  )
})
