import type { CapturePayload } from '../types/index.js'
import { handleCapture } from '../hooks/capture.js'

/**
 * CLI entry for the internal capture subcommand used by shell hooks.
 * @param options - commander options for capture
 */
export async function runCapture(options: {
  command: string
  exitCode: string
  directory: string
  gitBranch?: string
  stderr?: string
}): Promise<void> {
  const payload: CapturePayload = {
    command: options.command,
    exitCode: Number(options.exitCode),
    directory: options.directory,
    gitBranch: options.gitBranch || undefined,
    stderrSnippet: options.stderr,
  }

  if (!payload.command || Number.isNaN(payload.exitCode)) return
  if (payload.exitCode === 0) return

  await handleCapture(payload)
}
