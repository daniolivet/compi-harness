import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import { adapters } from '../../src/agents/registry.js'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cliPath = join(pkgRoot, 'dist/cli.js')

let currentTmp: string | null = null

beforeAll(() => {
  if (!existsSync(cliPath)) {
    throw new Error("dist/cli.js missing — run 'npm run build' first")
  }
})

afterEach(async () => {
  if (currentTmp) {
    await rm(currentTmp, { recursive: true, force: true })
    currentTmp = null
  }
})

const BASE_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'harness/init.sh',
  'harness/feature_list.json',
  'harness/hotfix_list.json',
  'harness/CHECKPOINTS.md',
  'harness/docs/architecture.md',
  'harness/docs/conventions.md',
  'harness/docs/verification.md',
  'harness/README.md',
]

describe('compi-harness init (E2E)', () => {
  it.each(adapters)('installs a green harness for $id', async (adapter) => {
    currentTmp = await mkdtemp(join(os.tmpdir(), `e2e-${adapter.id}-`))
    const tmp = currentTmp

    const res = spawnSync(
      'node',
      [cliPath, 'init', '--name', 'e2e-proj', '--agent', adapter.id],
      { cwd: tmp, encoding: 'utf8' },
    )
    if (res.status !== 0) {
      throw new Error(
        `init exited with ${res.status}\n--- stdout ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`,
      )
    }
    expect(res.status).toBe(0)

    for (const rel of BASE_FILES) {
      expect(existsSync(join(tmp, rel)), `missing base file: ${rel}`).toBe(true)
    }

    const featureList = await readFile(
      join(tmp, 'harness/feature_list.json'),
      'utf8',
    )
    expect(featureList).toContain('e2e-proj')
    expect(featureList).not.toContain('<project-name>')

    if (adapter.id === 'claude-code') {
      expect(existsSync(join(tmp, '.claude/agents/leader.md'))).toBe(true)
      expect(existsSync(join(tmp, 'agents'))).toBe(false)
    } else if (adapter.id === 'codex' || adapter.id === 'opencode') {
      expect(existsSync(join(tmp, 'agents/leader.md'))).toBe(true)
      expect(existsSync(join(tmp, '.claude/agents'))).toBe(false)
      expect(existsSync(join(tmp, 'CONVENTIONS.md'))).toBe(false)
      expect(existsSync(join(tmp, '.cursorrules'))).toBe(false)
      expect(existsSync(join(tmp, '.github/copilot-instructions.md'))).toBe(false)
    } else if (adapter.id === 'aider') {
      expect(existsSync(join(tmp, 'agents/leader.md'))).toBe(true)
      expect(existsSync(join(tmp, 'CONVENTIONS.md'))).toBe(true)
    } else if (adapter.id === 'cursor') {
      expect(existsSync(join(tmp, 'agents/leader.md'))).toBe(true)
      expect(existsSync(join(tmp, '.cursorrules'))).toBe(true)
    } else if (adapter.id === 'copilot') {
      expect(existsSync(join(tmp, 'agents/leader.md'))).toBe(true)
      expect(existsSync(join(tmp, '.github/copilot-instructions.md'))).toBe(true)
    }

    const verify = spawnSync('bash', ['harness/init.sh'], {
      cwd: tmp,
      encoding: 'utf8',
    })
    if (verify.status !== 0) {
      throw new Error(
        `harness/init.sh exited with ${verify.status}\n--- stdout ---\n${verify.stdout}\n--- stderr ---\n${verify.stderr}`,
      )
    }
    expect(verify.status).toBe(0)
  })
})
