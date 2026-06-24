import fs from "fs"
import path from "path"

const dir = "D:/opencode/packages/opencode/src/agent/prompt"
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'))

let count = 0
for (const file of files) {
  const fpath = path.join(dir, file)
  let content = fs.readFileSync(fpath, 'utf8')
  const before = content

  // Remove 'questions' and 'answers' fields from JSON output sections
  content = content.replace(/\n\s+"questions": \[[^\]]*\],?\n?/g, '\n')
  content = content.replace(/\n\s+"answers": \[[^\]]*\],?\n?/g, '\n')
  content = content.replace(/\n\s+"questions": \[\]\n?/g, '\n')
  content = content.replace(/\n\s+"answers": \[\]\n?/g, '\n')

  if (content !== before) {
    fs.writeFileSync(fpath, content)
    count++
    console.log(`Modified: ${file}`)
  }
}
console.log(`Total modified: ${count}`)
