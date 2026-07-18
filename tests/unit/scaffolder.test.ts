import { describe, it, expect, afterEach } from 'vitest'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import os from 'node:os'
import { isHarnessInstalled } from '../../src/core/scaffolder.js'

const TMP_DIRS: string[] = []

async function freshTmp(): Promise<string> {
  const tmp = await mkdtemp(join(os.tmpdir(), 'scaff-'))
  TMP_DIRS.push(tmp)
  return tmp
}

afterEach(async () => {
  while (TMP_DIRS.length) {
    const dir = TMP_DIRS.pop()!
    await rm(dir, { recursive: true, force: true })
  }
})

describe('isHarnessInstalled', () => {
  it('returns false for an empty directory', async () => {
    const tmp = await freshTmp()
    expect(await isHarnessInstalled(tmp)).toBe(false)
  })

  it('returns false when only AGENTS.md is present (needs both markers)', async () => {
    const tmp = await freshTmp()
    await writeFile(join(tmp, 'AGENTS.md'), '# stub\n')
    expect(await isHarnessInstalled(tmp)).toBe(false)
  })

  it('returns true when both AGENTS.md and harness/ exist', async () => {
    const tmp = await freshTmp()
    await writeFile(join(tmp, 'AGENTS.md'), '# stub\n')
    await mkdir(join(tmp, 'harness'))
    expect(await isHarnessInstalled(tmp)).toBe(true)
  })

  it('is idempotent: repeated calls on the same dir keep returning true', async () => {
    const tmp = await freshTmp()
    await writeFile(join(tmp, 'AGENTS.md'), '# stub\n')
    await mkdir(join(tmp, 'harness'))
    expect(await isHarnessInstalled(tmp)).toBe(true)
    expect(await isHarnessInstalled(tmp)).toBe(true)
  })
})
