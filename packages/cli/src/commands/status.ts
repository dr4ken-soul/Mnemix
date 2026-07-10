import {
  createSilentClient,
  getBaseUrl,
  getContainerTag,
  isSupermemoryRunning,
} from '../lib/supermemory.js'

/**
 * Checks Supermemory Local health and reports stored fix count when available.
 */
export async function runStatus(): Promise<void> {
  const running = await isSupermemoryRunning()
  const host = getBaseUrl().replace(/^https?:\/\//, '')

  if (!running) {
    process.stdout.write('Supermemory Local: not running\n')
    process.stdout.write('start it with: npx supermemory setup\n')
    return
  }

  process.stdout.write(`Supermemory Local: running (${host})\n`)

  const client = await createSilentClient()
  if (!client) {
    process.stdout.write('mnemix fixes stored: unknown\n')
    return
  }

  try {
    const response = await client.documents.list({
      containerTags: [getContainerTag()],
      limit: 500,
    })
    const raw = response as unknown as {
      memories?: unknown[]
      results?: unknown[]
      documents?: unknown[]
    }
    const memories =
      raw.memories ??
      raw.results ??
      raw.documents ??
      (Array.isArray(response) ? response : [])
    process.stdout.write(`mnemix fixes stored: ${memories.length}\n`)
  } catch {
    process.stdout.write('mnemix fixes stored: unknown\n')
  }
}
