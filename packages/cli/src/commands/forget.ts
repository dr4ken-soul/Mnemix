import { createInterface } from 'readline'
import { createSupermemoryClient } from '../lib/supermemory.js'

/**
 * Prompts for confirmation on stdin.
 * @param question - prompt text
 * @returns true when the user confirms
 */
function askConfirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      const normalised = answer.trim().toLowerCase()
      resolve(normalised === 'y' || normalised === 'yes')
    })
  })
}

/**
 * Removes a single fix document from Supermemory Local by ID.
 * @param id - memory document ID
 */
export async function runForget(id: string): Promise<void> {
  if (!id) {
    process.stderr.write('usage: mnemix forget <id>\n')
    process.exitCode = 1
    return
  }

  const client = await createSupermemoryClient()
  if (!client) {
    process.exitCode = 1
    return
  }

  const confirmed = await askConfirm(`remove fix ${id}? (y/N) `)
  if (!confirmed) {
    process.stdout.write('cancelled\n')
    return
  }

  try {
    await client.documents.delete(id)
    process.stdout.write(`removed ${id}\n`)
  } catch {
    process.stderr.write(`failed to remove ${id}\n`)
    process.exitCode = 1
  }
}
