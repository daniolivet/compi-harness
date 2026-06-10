import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { agentsDir } from '../core/templates.js'
import type { AgentAdapter } from './types.js'

/**
 * Claude Code reads CLAUDE.md (already in base) and discovers native subagents
 * in .claude/agents/. We drop the role definitions there — and nowhere else,
 * so there is no redundant root agents/ folder for a Claude-only install.
 */
export const claudeCode: AgentAdapter = {
  id: 'claude-code',
  label: 'Claude Code',
  hint: '.claude/agents/ (native subagents)',
  requiresRootAgents: false,
  async apply({ targetRoot }) {
    await cp(agentsDir, join(targetRoot, '.claude', 'agents'), { recursive: true })
    return ['.claude/agents/']
  },
}
