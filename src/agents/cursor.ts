import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { adaptersDir } from '../core/templates.js'
import type { AgentAdapter } from './types.js'

/** Cursor does not read AGENTS.md directly: we drop a .cursorrules bridge. */
export const cursor: AgentAdapter = {
  id: 'cursor',
  label: 'Cursor',
  hint: '.cursorrules (bridge to AGENTS.md) + agents/',
  requiresRootAgents: true,
  async apply({ targetRoot }) {
    await cp(
      join(adaptersDir, 'cursor', '.cursorrules'),
      join(targetRoot, '.cursorrules'),
    )
    return ['.cursorrules']
  },
}
