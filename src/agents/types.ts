export interface AdapterContext {
  /** Root of the target repo where the base harness was already installed. */
  targetRoot: string
}

export interface AgentAdapter {
  /** Stable identifier (used in --agents=...). */
  id: string
  /** Human-readable name for the selection prompt. */
  label: string
  /** Short hint of what files it generates (shown in the summary). */
  hint: string
  /**
   * Whether this AI reads the subagent role definitions from the project-root
   * `agents/` folder (true for every tool except Claude Code, which uses
   * `.claude/agents/`). When at least one selected adapter needs it, the CLI
   * creates a single root `agents/` folder.
   */
  requiresRootAgents: boolean
  /**
   * Apply the AI-specific extras on top of the already-installed base harness.
   * Returns the (relative) created paths, for the final summary.
   */
  apply(ctx: AdapterContext): Promise<string[]>
}
