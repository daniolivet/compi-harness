import type { AgentAdapter } from './types.js'

/** Codex CLI reads AGENTS.md (already in base) and agents/ as markdown. No extras. */
export const codex: AgentAdapter = {
  id: 'codex',
  label: 'Codex CLI',
  hint: 'AGENTS.md + agents/ (out-of-the-box)',
  requiresRootAgents: true,
  async apply() {
    return []
  },
}
