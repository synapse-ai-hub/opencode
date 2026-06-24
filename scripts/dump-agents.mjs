import fs from "fs"
import path from "path"

const promptDir = "D:/opencode/packages/opencode/src/agent/prompt"

function parseYaml(str) {
  const lines = str.split(/\r?\n/)
  const result = {}
  const stack = []
  for (const line of lines) {
    if (!line.trim()) continue
    const indent = line.search(/[^ ]/)
    const level = indent / 2
    const trimmed = line.trim()
    while (stack.length > level) stack.pop()
    if (trimmed.endsWith(':')) {
      const key = trimmed.slice(0, -1)
      let obj = result
      for (const k of stack) obj = obj[k]
      obj[key] = {}
      stack[level] = key
    } else if (trimmed.includes(': ')) {
      const idx = trimmed.indexOf(': ')
      const k = trimmed.substring(0, idx)
      let v = trimmed.substring(idx + 2)
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
      let obj = result
      for (let i = 0; i < level; i++) obj = obj[stack[i]]
      obj[k] = v
    }
  }
  return result
}

const KEEP = new Set(['compaction.txt', 'compaction-cod.txt', 'title.txt'])
const agents = []

for (const file of fs.readdirSync(promptDir).sort()) {
  if (!file.endsWith('.txt')) continue
  if (KEEP.has(file)) continue
  const content = fs.readFileSync(path.join(promptDir, file), 'utf8').replace(/^\uFEFF/, '')
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) continue
  const fm = parseYaml(m[1])
  const name = fm.name || file.replace('.txt', '')
  agents.push({ file, name, fm, promptLength: content.length - m[0].length })
}

console.log(JSON.stringify(agents, null, 2))
