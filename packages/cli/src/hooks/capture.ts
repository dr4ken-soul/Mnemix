import type { CapturePayload } from '../types/index.js'
import { formatFixSuggestion, truncateErrorSnippet } from '../lib/format.js'
import {
  createSilentClient,
  getMaxErrorChars,
} from '../lib/supermemory.js'
import { writePending } from '../lib/pending.js'
import { enqueueCapture } from '../lib/queue.js'
import { flushQueue } from './flush.js'
import { searchForFix } from './search.js'

/**
 * Handles a non-zero exit from shell hooks.
 * Searches for a past fix, prints a suggestion when relevant,
 * and stores the failure as pending for a later resolve.
 * When Supermemory Local is offline, queues the capture locally.
 * @param payload - capture data from the shell hook
 */
export async function handleCapture(payload: CapturePayload): Promise<void> {
  const client = await createSilentClient()
  if (!client) {
    enqueueCapture(payload)
    writePending({
      command: payload.command,
      errorSnippet: truncateErrorSnippet(
        payload.stderrSnippet ?? '',
        getMaxErrorChars(),
      ),
      directory: payload.directory,
      gitBranch: payload.gitBranch,
      failedAt: Date.now(),
    })
    return
  }

  // Best-effort flush of any offline work first
  await flushQueue(client)

  const errorSnippet = truncateErrorSnippet(
    payload.stderrSnippet ?? '',
    getMaxErrorChars(),
  )
  const errorLine = errorSnippet.split('\n')[0] ?? ''

  const match = await searchForFix(client, payload.command, errorLine)
  if (match) {
    process.stdout.write(
      `${formatFixSuggestion(
        match.fixCommand,
        match.directory,
        match.resolvedAt,
        match.gitBranch,
      )}\n`,
    )
  }

  writePending({
    command: payload.command,
    errorSnippet,
    directory: payload.directory,
    gitBranch: payload.gitBranch,
    failedAt: Date.now(),
  })
}
