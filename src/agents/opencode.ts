import type { AgentAdapter } from './types.js'

/** OpenCode reads AGENTS.md (already in base) and agents/ as markdown. No extras. */
export const opencode: AgentAdapter = {
  id: 'opencode',
  label: 'OpenCode',
  hint: 'AGENTS.md + agents/ (out-of-the-box)',
  requiresRootAgents: true,
  async apply() {
    return []
  },
}
