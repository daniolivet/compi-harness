import { basename, join } from 'node:path'
import { cp } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import {
  intro,
  outro,
  select,
  text,
  isCancel,
  cancel,
  spinner,
  log,
} from '@clack/prompts'
import { isHarnessInstalled, installBase } from '../core/scaffolder.js'
import { applyProjectName } from '../core/writers.js'
import { adapters, getAdapters, isValidAdapterId } from '../agents/registry.js'
import { agentsDir } from '../core/templates.js'

export interface InitOptions {
  /** Reinstall even if a harness already exists. */
  force?: boolean
  /** Project name (non-interactive mode). */
  name?: string
  /** AI tool id (non-interactive mode). One AI per repo. */
  agent?: string
}

export async function runInit(opts: InitOptions = {}): Promise<void> {
  const targetRoot = process.cwd()
  intro('compi-harness init')

  // 1. Idempotency guard.
  if ((await isHarnessInstalled(targetRoot)) && !opts.force) {
    cancel(
      'A harness is already installed in this directory. Use --force to reinstall it.',
    )
    process.exitCode = 1
    return
  }

  // 2. AI tool selection (one AI per repo).
  const agentId = await resolveAgent(opts.agent)
  if (!agentId) return // cancelled

  // 3. Project name.
  const name = await resolveName(opts.name, targetRoot)
  if (name === null) return // cancelled

  // 4. Base scaffolding + placeholder substitution.
  const s = spinner()
  s.start('Installing the base harness')
  await installBase(targetRoot)
  await applyProjectName(targetRoot, name)
  s.stop('Base harness installed')

  // 5. Per-AI adapter layer.
  const chosen = getAdapters([agentId])
  const created: string[] = []

  // Root agents/ only for AIs that read role definitions from the project root
  // (every tool except Claude Code, which uses .claude/agents/). Created once.
  if (chosen.some((a) => a.requiresRootAgents)) {
    await cp(agentsDir, join(targetRoot, 'agents'), { recursive: true })
    const labels = chosen
      .filter((a) => a.requiresRootAgents)
      .map((a) => a.label)
      .join(', ')
    created.push(`agents/  (${labels})`)
  }

  for (const adapter of chosen) {
    const paths = await adapter.apply({ targetRoot })
    created.push(...paths.map((p) => `${p}  (${adapter.label})`))
  }
  if (created.length) {
    log.info(`Per-AI extras:\n  - ${created.join('\n  - ')}`)
  }

  // 6. Verify with the harness guardian.
  log.step('Running ./harness/init.sh')
  const res = spawnSync('bash', ['harness/init.sh'], {
    cwd: targetRoot,
    encoding: 'utf8',
  })
  if (res.stdout) log.message(res.stdout.trim())
  if (res.status === 0) {
    outro('Harness ready. ./harness/init.sh is green. ✅')
  } else {
    log.warn('./harness/init.sh failed — check the [FAIL] lines above.')
    outro('Harness installed, but verification did not pass.')
    process.exitCode = 1
  }
}

async function resolveAgent(flag?: string): Promise<string | null> {
  if (flag !== undefined) {
    const id = flag.trim()
    if (!isValidAdapterId(id)) {
      cancel(`Invalid --agent. Valid ids: ${adapters.map((a) => a.id).join(', ')}`)
      process.exitCode = 1
      return null
    }
    return id
  }

  const selected = await select({
    message: 'Which AI coding tool will you use in this repo?',
    options: adapters.map((a) => ({ value: a.id, label: a.label, hint: a.hint })),
  })
  if (isCancel(selected)) {
    cancel('Cancelled.')
    return null
  }
  return selected as string
}

async function resolveName(
  flag: string | undefined,
  targetRoot: string,
): Promise<string | null> {
  const fallback = basename(targetRoot)
  if (flag !== undefined) return flag || fallback

  const res = await text({
    message: 'Project name (short slug):',
    placeholder: fallback,
    defaultValue: fallback,
  })
  if (isCancel(res)) {
    cancel('Cancelled.')
    return null
  }
  return (res as string) || fallback
}
