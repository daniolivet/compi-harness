import { describe, it, expect } from 'vitest'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Dirent } from 'node:fs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

type Kind = 'dir' | 'file'

async function collectTree(
  root: string,
  excludes: string[],
): Promise<Map<string, Kind>> {
  const result = new Map<string, Kind>()

  async function walk(abs: string, rel: string): Promise<void> {
    const entries: Dirent[] = await readdir(abs, { withFileTypes: true })
    for (const entry of entries) {
      const childRel = rel === '' ? entry.name : `${rel}/${entry.name}`
      const excluded = excludes.some(
        (ex) => childRel === ex || childRel.startsWith(`${ex}/`),
      )
      if (excluded) continue
      if (entry.isDirectory()) {
        result.set(childRel, 'dir')
        await walk(join(abs, entry.name), childRel)
      } else if (entry.isFile()) {
        result.set(childRel, 'file')
      }
    }
  }

  await walk(root, '')
  return result
}

async function compareDirs(
  liveDir: string,
  templateDir: string,
  excludes: string[],
): Promise<string[]> {
  const live = await collectTree(liveDir, excludes)
  const template = await collectTree(templateDir, excludes)
  const failures: string[] = []
  const allRels = new Set<string>([...live.keys(), ...template.keys()])

  for (const rel of allRels) {
    const liveKind = live.get(rel)
    const templateKind = template.get(rel)
    if (liveKind && !templateKind) {
      failures.push(`${rel} only in live`)
    } else if (!liveKind && templateKind) {
      failures.push(`${rel} only in template`)
    } else if (liveKind && templateKind && liveKind === templateKind) {
      if (liveKind === 'file') {
        const liveContent = await readFile(join(liveDir, rel), 'utf8')
        const templateContent = await readFile(join(templateDir, rel), 'utf8')
        if (liveContent !== templateContent) {
          failures.push(`${rel} differs`)
        }
      }
    } else if (liveKind && templateKind && liveKind !== templateKind) {
      failures.push(
        `${rel} differs (kind: live=${liveKind} template=${templateKind})`,
      )
    }
  }

  return failures
}

describe('anti-drift', () => {
  it('live harness/ and agents/ match their templates', async () => {
    const failures: string[] = []

    failures.push(
      ...await compareDirs(
        join(repoRoot, 'harness'),
        join(repoRoot, 'templates/base/harness'),
        ['progress', 'feature_list.json', 'hotfix_list.json'],
      ),
    )

    failures.push(
      ...await compareDirs(
        join(repoRoot, 'agents'),
        join(repoRoot, 'templates/agents'),
        [],
      ),
    )

    expect(failures, failures.join('\n')).toEqual([])
  })
})
