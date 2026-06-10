import { cp, access } from 'node:fs/promises'
import { join } from 'node:path'
import { baseDir } from './templates.js'

/**
 * A repo is considered "already adopted" if it has the harness markers at its
 * root. Used as an idempotency guard: we do not reinstall on top without --force.
 */
export async function isHarnessInstalled(targetRoot: string): Promise<boolean> {
  const markers = ['AGENTS.md', 'harness']
  for (const marker of markers) {
    try {
      await access(join(targetRoot, marker))
    } catch {
      return false
    }
  }
  return true
}

/**
 * Copy the base harness (common to every AI) into the target repo, preserving
 * permissions (e.g. the executable bit on harness/init.sh).
 */
export async function installBase(targetRoot: string): Promise<void> {
  await cp(baseDir, targetRoot, { recursive: true })
}
