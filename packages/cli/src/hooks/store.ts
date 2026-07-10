import type Supermemory from 'supermemory'
import { truncateErrorSnippet } from '../lib/format.js'
import { getContainerTag, getMaxErrorChars } from '../lib/supermemory.js'

/**
 * Stores a resolved fix as a Supermemory document.
 * The document is tagged with the mnemix-fixes container for isolation.
 * @param client - configured Supermemory client
 * @param failingCommand - the command that produced a non-zero exit code
 * @param errorSnippet - first 300 characters of stderr output
 * @param fixCommand - the command that resolved the failure
 * @param directory - working directory at the time of the failure
 * @param gitBranch - git branch if inside a repo, undefined otherwise
 */
export async function storeFix(
  client: Supermemory,
  failingCommand: string,
  errorSnippet: string,
  fixCommand: string,
  directory: string,
  gitBranch?: string,
): Promise<void> {
  const truncated = truncateErrorSnippet(errorSnippet, getMaxErrorChars())
  const content = [
    `failing command: ${failingCommand}`,
    `error: ${truncated}`,
    `fix: ${fixCommand}`,
    `directory: ${directory}`,
    gitBranch ? `branch: ${gitBranch}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  await client.add({
    content,
    containerTags: [getContainerTag()],
    metadata: {
      failingCommand,
      fixCommand,
      directory,
      gitBranch: gitBranch ?? '',
      resolvedAt: Date.now(),
    },
  })
}
