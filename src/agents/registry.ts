import type { AgentAdapter } from './types.js'
import { claudeCode } from './claude-code.js'
import { codex } from './codex.js'
import { opencode } from './opencode.js'
import { aider } from './aider.js'
import { cursor } from './cursor.js'
import { copilot } from './copilot.js'

/** Order in which they are offered in the selection prompt. */
export const adapters: AgentAdapter[] = [
  claudeCode,
  codex,
  opencode,
  aider,
  cursor,
  copilot,
]

export function getAdapters(ids: string[]): AgentAdapter[] {
  return adapters.filter((a) => ids.includes(a.id))
}

export function isValidAdapterId(id: string): boolean {
  return adapters.some((a) => a.id === id)
}
