import { cp, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { adaptersDir } from '../core/templates.js'
import type { AgentAdapter } from './types.js'

/** Copilot reads .github/copilot-instructions.md: we drop a bridge there. */
export const copilot: AgentAdapter = {
  id: 'copilot',
  label: 'GitHub Copilot',
  hint: '.github/copilot-instructions.md (bridge) + agents/',
  requiresRootAgents: true,
  async apply({ targetRoot }) {
    await mkdir(join(targetRoot, '.github'), { recursive: true })
    await cp(
      join(adaptersDir, 'copilot', '.github', 'copilot-instructions.md'),
      join(targetRoot, '.github', 'copilot-instructions.md'),
    )
    return ['.github/copilot-instructions.md']
  },
}
