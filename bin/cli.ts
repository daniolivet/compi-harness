#!/usr/bin/env node
import { Command } from 'commander'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { runInit } from '../src/commands/init.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
) as { version: string }

const program = new Command()

program
  .name('compi-harness')
  .description(
    'Install and configure the compi-harness in your repository, adapted to your AI coding tool.',
  )
  .version(pkg.version)

program
  .command('init')
  .description('Initialize the harness in the current repository.')
  .option('--force', 'Overwrite an already-installed harness.')
  .option('--name <name>', 'Project name (non-interactive mode).')
  .option(
    '--agent <id>',
    'AI tool (one per repo): claude-code | codex | opencode | aider | cursor | copilot.',
  )
  .action((opts) => runInit(opts))

program
  .command('update')
  .description('Update the installed harness to the CLI version. (stub)')
  .action(() => {
    console.log('update: coming soon.')
  })

program
  .command('check')
  .description('Check the state of the harness in the repository. (stub)')
  .action(() => {
    console.log('check: coming soon.')
  })

program.parseAsync(process.argv)
