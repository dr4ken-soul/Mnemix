#!/usr/bin/env node
import { Command } from 'commander'
import { runInstall } from './commands/install.js'
import { runCapture } from './commands/capture.js'
import { runResolve } from './commands/resolve.js'
import { runList } from './commands/list.js'
import { runForget } from './commands/forget.js'
import { runStats } from './commands/stats.js'
import { runStatus } from './commands/status.js'

const program = new Command()

program
  .name('mnemix')
  .description('Shell memory daemon. Your terminal remembers every fix.')
  .version('0.1.0')

program
  .command('install')
  .description('Installs shell hooks into .zshrc or .bashrc')
  .action(async () => {
    await runInstall()
  })

program
  .command('capture')
  .description('Internal. Called by shell hooks on non-zero exit')
  .requiredOption('--command <command>', 'failing command text')
  .requiredOption('--exit-code <code>', 'exit code')
  .requiredOption('--directory <path>', 'working directory')
  .option('--git-branch <branch>', 'git branch if any')
  .option('--stderr <text>', 'stderr snippet')
  .action(async (options) => {
    await runCapture(options)
  })

program
  .command('resolve')
  .description('Internal. Called by shell hooks when a fix follows a failure')
  .requiredOption('--command <command>', 'resolving command text')
  .requiredOption('--directory <path>', 'working directory')
  .option('--git-branch <branch>', 'git branch if any')
  .action(async (options) => {
    await runResolve(options)
  })

program
  .command('list')
  .description('Lists all stored fixes')
  .action(async () => {
    await runList()
  })

program
  .command('forget')
  .description('Removes a fix by its ID after confirmation')
  .argument('<id>', 'memory document ID')
  .action(async (id: string) => {
    await runForget(id)
  })

program
  .command('stats')
  .description('Prints memory summary')
  .action(async () => {
    await runStats()
  })

program
  .command('status')
  .description('Checks whether Supermemory Local is running')
  .action(async () => {
    await runStatus()
  })

program.parse()
