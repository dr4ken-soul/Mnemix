# Mnemix — App Blueprint

## Product Summary

Mnemix is a shell memory daemon built on Supermemory Local. It hooks silently into zsh and bash, captures every command alongside its exit code, working directory and git branch, and stores that context locally. When a command fails, Mnemix searches its memory for the last time you encountered a similar error and how you fixed it, then prints that fix directly below the error in your terminal. The entire memory layer runs on your machine. Nothing leaves it.

Built for the Supermemory Local Hackathon (localhost:6767), July 9 to 13 2026. Supermemory Local is the entire backend. Remove it and there is no product, only a logging script with no intelligence.

---

## Market Context

**Who this is for:**

1. Developers who regularly hit the same shell errors across projects and lose time re-googling fixes they have already discovered
2. Engineers working across multiple machines or projects who want their institutional terminal knowledge to persist without syncing to any cloud service
3. Teams where junior developers repeat mistakes that seniors have already solved but never documented

**What they currently use:** Google, Stack Overflow, command history search with `Ctrl+R`, shell aliases and custom functions maintained manually, or simply remembering. None of these connect the error to the fix and surface it in context.

**Why they switch:** Every other solution requires the developer to remember to search, remember the right keywords, or remember to document the fix. Mnemix requires nothing. It watches, learns and surfaces. The first time it saves you re-googling an error you solved three weeks ago, it earns its place permanently in your shell config.

---

## MVP Feature Set

### Feature 1: Shell Hook Installation

**User story:** As a developer I want to install Mnemix once and have it work in every terminal session without any further setup.

**How it works:** Running `mnemix install` detects the user's shell (zsh or bash), appends a single source line to the appropriate rc file, and writes the hook templates to `~/.mnemix/`. On the next shell session the hooks are active. No background process, no daemon to manage. The hooks are native shell functions that call the Mnemix CLI binary on each prompt cycle.

**Acceptance criteria:** After `mnemix install` and opening a new terminal session, commands are captured silently with no visible latency increase. The source line appears exactly once in the rc file even if `mnemix install` is run multiple times.

**Complexity:** Low

---

### Feature 2: Command Capture

**User story:** As a developer I want Mnemix to silently record every command I run so that it can learn from my terminal behaviour over time.

**How it works:** The `preexec` hook (zsh) and `DEBUG` trap (bash) capture the command text before execution. The `precmd` hook and `PROMPT_COMMAND` capture the exit code after execution. If the exit code is non-zero, the capture is forwarded to `mnemix capture` with the command text, error context, directory and git branch. If the exit code is zero and the previous command failed, the fix is logged via `mnemix resolve`.

**Acceptance criteria:** All commands with non-zero exit codes are captured within 200 milliseconds of the prompt returning. No visible delay appears in the terminal between a command completing and the next prompt appearing. The capture is entirely silent on success.

**Complexity:** Medium

---

### Feature 3: Fix Storage

**User story:** As a developer I want Mnemix to learn what fixes work for which errors so that it can recall them later.

**How it works:** When a command exits zero immediately after a non-zero command in the same directory and git context, Mnemix treats the second command as the fix for the first. It stores a Supermemory document containing the failing command, a truncated error snippet (first 300 characters of stderr), the fix command, the directory, the git branch and a timestamp. The document is stored under the container tag `mnemix-fixes` to keep it isolated from any other Supermemory usage on the machine.

**Acceptance criteria:** Fix documents appear in Supermemory Local within two seconds of the resolving command being run. Running `mnemix list` shows the stored fix correctly. The stored document never contains more than 300 characters of error output.

**Complexity:** Medium

---

### Feature 4: Error Recovery Search

**User story:** As a developer I want Mnemix to tell me how I fixed this same error last time so that I do not lose time re-searching.

**How it works:** On any non-zero exit code, Mnemix constructs a search query from the failing command text and the first line of stderr output, then queries Supermemory Local. If a match above a relevance threshold is found, Mnemix prints a formatted suggestion below the error in the terminal. The suggestion shows the fix command, the directory context it came from, and how long ago it was used.

Output format:
```
mnemix › found 1 match from 3 weeks ago
fix: git stash && git pull origin main
context: ~/projects/api · branch: main
```

If no match is found, nothing is printed. Mnemix is silent when it has nothing useful to say.

**Acceptance criteria:** Relevant fixes surface within 500 milliseconds of the failing prompt returning. Irrelevant matches are not shown (relevance threshold enforced). When no match exists, the terminal output is identical to a terminal without Mnemix installed.

**Complexity:** High

---

### Feature 5: Memory Management

**User story:** As a developer I want to view and manage my stored fixes so that I can keep my memory clean and relevant.

**How it works:** Three CLI subcommands cover the full management surface.

`mnemix list` — prints all stored fixes as a numbered table: ID, failing command, fix command, directory, how long ago.

`mnemix forget <id>` — removes a single fix document from Supermemory Local by its ID. Asks for confirmation before deleting.

`mnemix stats` — prints a short summary: total fixes stored, oldest fix date, most-matched fix in the last 30 days.

**Acceptance criteria:** `mnemix list` returns within one second for up to 500 stored fixes. `mnemix forget` removes the correct document and prints a confirmation. `mnemix stats` reflects the current state of Supermemory Local accurately.

**Complexity:** Low

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| CLI runtime | Node.js 18+ with TypeScript | Fast startup, strong npm ecosystem, easy global install via npm |
| Shell hooks | Native zsh/bash hooks | No external dependency, universal, zero latency overhead |
| Memory layer | Supermemory Local | The hackathon requirement and the entire intelligence layer. Handles embeddings, storage and semantic search locally |
| Supermemory SDK | @supermemory/client | Official JS SDK, full API coverage |
| CLI argument parsing | Commander.js | Lightweight, well-maintained, idiomatic Node.js CLI structure |
| Terminal formatting | chalk | Minimal, widely used, handles colour and reset correctly |
| Landing page framework | React 18 + Vite + TypeScript | Fast build, standard tooling |
| Styling | Tailwind CSS v3 | Utility-first, no runtime overhead |
| Animations | motion/react | Production-grade, correct import path for v11+ |
| Icons | Lucide React | Clean, tree-shakeable |

---

## Supermemory Local Integration Detail

### Client initialisation

```typescript
/**
 * Initialises and returns the Supermemory Local client.
 * Reads the base URL from environment or defaults to localhost:3000.
 * Returns null and logs a warning if the server is unreachable.
 * @returns Supermemory client instance or null on connection failure
 */
import Supermemory from '@supermemory/client'

export async function createSupermemoryClient(): Promise<Supermemory | null> {
  const baseUrl = process.env.SUPERMEMORY_URL ?? 'http://localhost:3000'
  try {
    const client = new Supermemory({ baseUrl, apiKey: 'local' })
    await client.health.check()
    return client
  } catch {
    console.error('Supermemory Local is not running. Start it with: npx supermemory setup')
    return null
  }
}
```

### Storing a fix

```typescript
/**
 * Stores a resolved fix as a Supermemory document.
 * The document is tagged with the mnemix-fixes container for isolation.
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
  const content = [
    `failing command: ${failingCommand}`,
    `error: ${errorSnippet}`,
    `fix: ${fixCommand}`,
    `directory: ${directory}`,
    gitBranch ? `branch: ${gitBranch}` : '',
  ].filter(Boolean).join('\n')

  await client.memories.add({
    content,
    containerTags: ['mnemix-fixes'],
    metadata: {
      failingCommand,
      fixCommand,
      directory,
      gitBranch,
      resolvedAt: Date.now(),
    },
  })
}
```

### Searching for a fix

```typescript
/**
 * Searches Supermemory Local for a fix matching the current failure.
 * Returns the best match above the relevance threshold or null if none found.
 * @param command - the command that just failed
 * @param errorLine - the first line of stderr output
 * @returns the best matching fix document or null
 */
export async function searchForFix(
  client: Supermemory,
  command: string,
  errorLine: string,
): Promise<FixResult | null> {
  const query = `${command} ${errorLine}`.trim()
  const results = await client.search.query({
    q: query,
    containerTags: ['mnemix-fixes'],
    limit: 1,
  })
  if (!results.documents?.length) return null
  const top = results.documents[0]
  if ((top.score ?? 0) < 0.72) return null
  return {
    fixCommand: top.metadata?.fixCommand as string,
    directory: top.metadata?.directory as string,
    gitBranch: top.metadata?.gitBranch as string | undefined,
    resolvedAt: top.metadata?.resolvedAt as number,
  }
}
```

---

## Data Structures

```typescript
interface FixMemory {
  failingCommand: string
  errorSnippet: string     // max 300 characters
  fixCommand: string
  directory: string
  gitBranch?: string
  resolvedAt: number       // unix timestamp
}

interface FixResult {
  fixCommand: string
  directory: string
  gitBranch?: string
  resolvedAt: number
}

interface CapturePayload {
  command: string
  exitCode: number
  directory: string
  gitBranch?: string
  stderrSnippet?: string
}

interface MnemixStats {
  totalFixes: number
  oldestFixDate: number | null
  mostMatchedFix: string | null
}
```

---

## CLI Commands

| Command | Description |
|---|---|
| `mnemix install` | Installs shell hooks into `.zshrc` or `.bashrc` |
| `mnemix capture` | Internal. Called by shell hooks on non-zero exit |
| `mnemix resolve` | Internal. Called by shell hooks when a fix follows a failure |
| `mnemix list` | Lists all stored fixes in a numbered table |
| `mnemix forget <id>` | Removes a fix by its ID after confirmation |
| `mnemix stats` | Prints memory summary |
| `mnemix status` | Checks whether Supermemory Local is running and reachable |

---

## Environment Variables

```
SUPERMEMORY_URL=http://localhost:3000
MNEMIX_RELEVANCE_THRESHOLD=0.72
MNEMIX_MAX_ERROR_CHARS=300
MNEMIX_CONTAINER_TAG=mnemix-fixes
```

---

## Landing Page Routes

This is a single-page marketing site with no client-side routing. All sections live on the root `/` path. Deployed to Vercel as a static build.

---

## What Is Not Being Built in MVP

- Fish shell support
- Team memory sharing via a shared Supermemory instance
- IDE extension for inline fix hints
- Weekly digest of most-used fixes
- Fix confidence scoring shown to the user
- Automatic fix application without user review
- Windows PowerShell support

These are deferred until after the hackathon.

---

## Hackathon Build Priority

The deadline is Sunday July 13 2026, 23:59 PST. Judges score on meaningful use of Supermemory Local, demo quality and whether the project surprises them.

Priority order:
1. Supermemory Local running and accepting documents via the SDK
2. Shell hooks capturing commands and exit codes correctly in isolation
3. Fix storage working end-to-end: fail a command, run the fix, confirm the document appears in Supermemory
4. Search working: reproduce the failing command, confirm the fix surfaces in the terminal
5. Landing page live and deployed
6. `mnemix list`, `mnemix forget` and `mnemix stats` working
7. README complete with install steps, demo video link and how Supermemory Local is used
