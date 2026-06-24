import fs from "fs"
import path from "path"

const dir = "D:/opencode/packages/opencode/src/agent/prompt"
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'))

const SKIP = new Set(['compaction.txt', 'compaction-cod.txt', 'title.txt'])

function parseYamlSimple(str) {
  const lines = str.split(/\r?\n/)
  const result = {}
  const stack = []

  for (const line of lines) {
    if (!line.trim()) continue
    const indent = line.search(/[^ ]/)
    const level = indent / 2
    const trimmed = line.trim()

    // Trim stack to current level
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

const agents = []

for (const file of files.sort()) {
  if (SKIP.has(file)) continue
  if (file === 'explorer.txt') continue // renamed from explore?

  const content = fs.readFileSync(path.join(dir, file), 'utf8').replace(/^\uFEFF/, '')
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) {
    console.log(`WARN: ${file} has no frontmatter`)
    continue
  }

  const fm = parseYamlSimple(m[1])
  const promptBody = content.slice(m[0].length).trim()
  const name = fm.name || file.replace('.txt', '')
  
  agents.push({ file, name, fm, promptBody })
  console.log(`OK: ${file} → ${name}${fm.hidden ? ' [HIDDEN]' : ''}`)
}

console.log(`\nTotal agents: ${agents.length}`)

// Generate agent.ts code
console.log('\n=== GENERATED agent.ts CODE ===')
console.log('// Imports')
console.log("import PROMPT_COMPACTION from './prompt/compaction.txt'")
console.log("import PROMPT_COMPACTION_COD from './prompt/compaction-cod.txt'")
console.log("import PROMPT_TITLE from './prompt/title.txt'")
console.log('')
for (const a of agents) {
  console.log(`import PROMPT_${a.name.toUpperCase().replace(/-/g, '_')} from './prompt/${a.file}'`)
}
