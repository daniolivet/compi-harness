import { describe, it, expect } from 'vitest'
import {
  adapters,
  getAdapters,
  isValidAdapterId,
} from '../../src/agents/registry.js'

describe('registry', () => {
  it('exposes the six adapters in the canonical order', () => {
    expect(adapters).toHaveLength(6)
    expect(adapters.map((a) => a.id)).toEqual([
      'claude-code',
      'codex',
      'opencode',
      'aider',
      'cursor',
      'copilot',
    ])
  })

  it('isValidAdapterId returns true for every registered id and false otherwise', () => {
    for (const a of adapters) {
      expect(isValidAdapterId(a.id)).toBe(true)
    }
    expect(isValidAdapterId('nope')).toBe(false)
    expect(isValidAdapterId('')).toBe(false)
  })

  it('getAdapters returns the matching adapters and ignores unknown ids', () => {
    const picked = getAdapters(['claude-code', 'aider'])
    expect(picked).toHaveLength(2)
    expect(picked.map((a) => a.id).sort()).toEqual(['aider', 'claude-code'])

    expect(getAdapters(['nope'])).toEqual([])
  })
})
