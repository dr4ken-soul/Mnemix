# Mnemix

Your terminal remembers every fix. You never debug the same error twice.

Mnemix is a shell memory daemon built on Supermemory Local. It hooks into zsh and bash, captures commands and exit codes, and when a command fails it surfaces how you fixed the same problem last time.

No cloud. No chat. No account. Everything stays on your machine.

## How it uses Supermemory Local

Supermemory Local is the full intelligence layer. Mnemix stores each resolved fix as a document under the container tag `mnemix-fixes` and searches those documents with semantic search when a command exits non-zero. Without Supermemory Local there is no product, only logging.

Default endpoint: `http://localhost:6767`

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
