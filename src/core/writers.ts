import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PROJECT_PLACEHOLDER = '<project-name>'

/**
 * Replace the project-name placeholder in the work queues. Only touches files
 * that actually contain the placeholder (idempotent).
 */
export async function applyProjectName(
  targetRoot: string,
  name: string,
): Promise<string[]> {
  const targets = [
    join(targetRoot, 'harness', 'feature_list.json'),
    join(targetRoot, 'harness', 'hotfix_list.json'),
  ]

  const changed: string[] = []
  for (const file of targets) {
    let content: string
    try {
      content = await readFile(file, 'utf8')
    } catch {
      continue
    }
    if (content.includes(PROJECT_PLACEHOLDER)) {
      await writeFile(file, content.split(PROJECT_PLACEHOLDER).join(name))
      changed.push(file)
    }
  }
  return changed
}
