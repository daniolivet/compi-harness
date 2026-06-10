import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { adaptersDir } from '../core/templates.js'
import type { AgentAdapter } from './types.js'

/** Aider reads AGENTS.md (already in base) and CONVENTIONS.md. We add the latter. */
export const aider: AgentAdapter = {
  id: 'aider',
  label: 'Aider',
  hint: 'AGENTS.md + CONVENTIONS.md + agents/',
  requiresRootAgents: true,
  async apply({ targetRoot }) {
    await cp(
      join(adaptersDir, 'aider', 'CONVENTIONS.md'),
      join(targetRoot, 'CONVENTIONS.md'),
    )
    return ['CONVENTIONS.md']
  },
}
