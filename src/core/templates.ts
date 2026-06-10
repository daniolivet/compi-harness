import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// The bundle is emitted to dist/cli.js, so the package root is the parent of
// dist/. templates/ ships alongside the package (see package.json -> "files").
const here = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(here, '..')

export const templatesDir = resolve(packageRoot, 'templates')
export const baseDir = resolve(templatesDir, 'base')
export const adaptersDir = resolve(templatesDir, 'adapters')
/** Subagent role definitions. Placed by adapters (.claude/agents/ or root agents/). */
export const agentsDir = resolve(templatesDir, 'agents')
