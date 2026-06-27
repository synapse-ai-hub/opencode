import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { createMemo } from "solid-js"

const id = "internal:sidebar-messages"

function View(props: { api: TuiPluginApi; session_id: string }) {
  const theme = () => props.api.theme.current
  const msgs = createMemo(() => props.api.state.session.messages(props.session_id))
  const session = createMemo(() => props.api.state.session.get(props.session_id))

  const label = createMemo(() => {
    const messages = msgs()
    let total = 0
    for (let i = 0; i < messages.length; i++) {
      const role = messages[i].role
      if (role === "user" || role === "assistant") total++
    }
    const meta = session()?.metadata as Record<string, unknown> | undefined
    const limit = (meta?.context_limit as number | undefined) ?? -1
    const shown = limit === -1 ? total : limit
    return `${shown}/${total}`
  })

  return (
    <box>
      <text>
        <span style={{ fg: theme().text }}><b>Messages </b></span>
        <span style={{ fg: theme().textMuted }}>{label()}</span>
      </text>
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 50,
    slots: {
      sidebar_content(_ctx, props) {
        return <View api={api} session_id={props.session_id} />
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
