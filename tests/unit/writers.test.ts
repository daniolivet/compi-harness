import { describe, it, expect, afterEach } from 'vitest'
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import os from 'node:os'
import { applyProjectName } from '../../src/core/writers.js'

const TMP_DIRS: string[] = []

async function freshTmp(): Promise<string> {
  const tmp = await mkdtemp(join(os.tmpdir(), 'writers-'))
  TMP_DIRS.push(tmp)
  return tmp
}

async function seedLists(tmp: string): Promise<void> {
  await mkdir(join(tmp, 'harness'), { recursive: true })
  await writeFile(
    join(tmp, 'harness', 'feature_list.json'),
    '{"project":"<project-name>","features":[]}',
  )
  await writeFile(
    join(tmp, 'harness', 'hotfix_list.json'),
    '{"project":"<project-name>","hotfixes":[]}',
  )
}

afterEach(async () => {
  while (TMP_DIRS.length) {
    const dir = TMP_DIRS.pop()!
    await rm(dir, { recursive: true, force: true })
  }
})

describe('applyProjectName', () => {
  it('replaces the placeholder in both list files and returns their paths', async () => {
    const tmp = await freshTmp()
    await seedLists(tmp)

    const featurePath = join(tmp, 'harness', 'feature_list.json')
    const hotfixPath = join(tmp, 'harness', 'hotfix_list.json')

    const changed = await applyProjectName(tmp, 'my-proj')
    expect(changed).toEqual([featurePath, hotfixPath])

    const feature = await readFile(featurePath, 'utf8')
    const hotfix = await readFile(hotfixPath, 'utf8')
    expect(feature).toContain('my-proj')
    expect(feature).not.toContain('<project-name>')
    expect(hotfix).toContain('my-proj')
    expect(hotfix).not.toContain('<project-name>')
  })

  it('is idempotent: a second call with the same name returns [] and does not mutate', async () => {
    const tmp = await freshTmp()
    await seedLists(tmp)

    await applyProjectName(tmp, 'my-proj')
    const featurePath = join(tmp, 'harness', 'feature_list.json')
    const hotfixPath = join(tmp, 'harness', 'hotfix_list.json')
    const featureBefore = await readFile(featurePath, 'utf8')
    const hotfixBefore = await readFile(hotfixPath, 'utf8')

    const changed = await applyProjectName(tmp, 'my-proj')
    expect(changed).toEqual([])

    expect(await readFile(featurePath, 'utf8')).toBe(featureBefore)
    expect(await readFile(hotfixPath, 'utf8')).toBe(hotfixBefore)
  })

  it('returns [] and does not throw when the list files are missing', async () => {
    const tmp = await freshTmp()
    const changed = await applyProjectName(tmp, 'x')
    expect(changed).toEqual([])
  })

  it('is content-gated, not name-gated: a different name returns [] once the placeholder is gone', async () => {
    const tmp = await freshTmp()
    await seedLists(tmp)
    await applyProjectName(tmp, 'my-proj')

    const changed = await applyProjectName(tmp, 'other')
    expect(changed).toEqual([])
  })
})
