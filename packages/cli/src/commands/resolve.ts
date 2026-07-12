import { createSilentClient } from '../lib/supermemory.js'
import { clearPending, readPending } from '../lib/pending.js'
import { enqueueResolve } from '../lib/queue.js'
import { flushQueue } from '../hooks/flush.js'
import { storeFix } from '../hooks/store.js'
import { storeLocalFix } from '../lib/localMemory.js'

/**
 * Pairs a successful command with the previous pending failure and stores the fix.
 * When Supermemory is online, stores via the API.
 * When offline, writes directly to ~/.mnemix/memory.json as a local fallback.
 * @param options - resolve options from shell hooks
 */
export async function runResolve(options: {
  command: string
  directory: string
  gitBranch?: string
}): Promise<void> {
  const pending = readPending()
  if (!pending) return

  if (pending.directory !== options.directory) {
    return
  }

  if (pending.command === options.command) {
    clearPending()
    return
  }

  // INTELLIGENCE UPGRADE: Ignore exploratory commands.
  // If the user fails a command, then types `ls` or `cd` to look around,
  // we shouldn't record `ls` as the fix. We keep the pending failure active
  // until they run a real command.
  const ignorePrefixes = ['cd ', 'ls', 'cat ', 'echo ', 'clear', 'pwd', 'history']
  const isExploratory = ignorePrefixes.some(prefix => 
    options.command.trim().startsWith(prefix) || options.command.trim() === prefix.trim()
  )
  
  if (isExploratory) {
    return // Do not clear pending, keep waiting for the real fix
  }

  const client = await createSilentClient()
  if (!client) {
    // Always write to local memory so the offline fallback can search it
    storeLocalFix({
      command: pending.command,
      errorSnippet: pending.errorSnippet,
      fixCommand: options.command,
      directory: pending.directory,
      gitBranch: pending.gitBranch,
      resolvedAt: Date.now(),
    })
    enqueueResolve(pending, options.command)
    clearPending()
    return
  }

  try {
    await flushQueue(client)
    await storeFix(
      client,
      pending.command,
      pending.errorSnippet,
      options.command,
      pending.directory,
      pending.gitBranch,
    )
    // Also write to local memory as a redundant offline cache
    storeLocalFix({
      command: pending.command,
      errorSnippet: pending.errorSnippet,
      fixCommand: options.command,
      directory: pending.directory,
      gitBranch: pending.gitBranch,
      resolvedAt: Date.now(),
    })
  } catch {
    storeLocalFix({
      command: pending.command,
      errorSnippet: pending.errorSnippet,
      fixCommand: options.command,
      directory: pending.directory,
      gitBranch: pending.gitBranch,
      resolvedAt: Date.now(),
    })
    enqueueResolve(pending, options.command)
  } finally {
    clearPending()
  }
}
