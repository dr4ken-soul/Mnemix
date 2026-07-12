# Mnemix

Your terminal remembers every fix. You never debug the same error twice.

Mnemix is a shell memory daemon built on Supermemory Local. It hooks into zsh and bash, captures commands and exit codes, and when a command fails it surfaces how you fixed the same problem last time.

No cloud. No chat. No account. Everything stays on your machine.

## Architecture & Supermemory Local

Mnemix features a robust offline-first architecture:
1. **Offline Fallback**: Works instantly out of the box using a local JSON file (`~/.mnemix/memory.json`). You can use Mnemix with zero setup or dependencies.
2. **Supermemory Local Integration**: If you have Supermemory Local running, Mnemix automatically connects to it. It stores each resolved fix as a document and uses powerful AI semantic search to find fixes even when the error output isn't an exact match.

Default Supermemory endpoint: `http://localhost:6767`

## Install

```bash
npx supermemory setup
npm install -g mnemix && mnemix install
```

Restart your terminal after install.

## Commands

| Command | Description |
|---|---|
| `mnemix install` | Installs shell hooks into `.zshrc` or `.bashrc` |
| `mnemix list` | Lists stored fixes |
| `mnemix forget <id>` | Removes a fix by ID |
| `mnemix stats` | Memory summary |
| `mnemix status` | Checks Supermemory Local |

## Development

```bash
# monorepo root
npm install

# landing page
npm run dev:landing

# CLI
npm run build:cli
```

## Packages

- `packages/cli` — Node.js CLI and shell hooks
- `packages/landing` — marketing site (React + Vite)

## Licence

MIT
