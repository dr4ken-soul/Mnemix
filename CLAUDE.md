# Mnemix — Agent Context

## What This Is

Mnemix is a shell memory daemon. It hooks into zsh and bash, silently logs every command with its exit code, working directory and git branch, and stores that context in Supermemory Local running on the user's machine. When any command exits non-zero it searches memory for the last time the user hit a similar failure and how they resolved it, then surfaces the fix directly in the terminal. No cloud. No chat interface. No setup beyond two commands.

Built for the Supermemory Local Hackathon (localhost:6767). Five-day async online hackathon, July 9 to 13 2026. Submission deadline Sunday July 13 23:59 PST.

---

## One-Line Pitch

Your terminal remembers every fix. You never debug the same error twice.

---

## MVP Features

1. Shell hook installation — a single command installs the Mnemix hooks into the user's `.zshrc` or `.bashrc`. The hooks run silently on every command with zero perceived latency
2. Command capture — every command is recorded with its full text, exit code, working directory, git branch if inside a repo, and a unix timestamp
3. Fix storage — when a user resolves a previously failed command, Mnemix detects the recovery pattern and stores the context as a Supermemory document. The memory includes the failing command, the error output snippet, the working directory context and the fix that worked
4. Error recovery search — when any command exits non-zero, Mnemix queries Supermemory Local with the error text and command as the search input. If a relevant past fix is found it is printed inline below the error, attributed to the session it came from and how long ago it was
5. Memory management — users can run `mnemix list` to see stored fixes, `mnemix forget <id>` to remove one, and `mnemix stats` to see how many memories exist and how much Supermemory storage they occupy

Post-hackathon: fish shell support, team memory sharing via a shared Supermemory instance, IDE extension that surfaces fixes as inline hints, a weekly digest of most-used fixes.

---

## Stack

| Layer | Technology |
|---|---|
| CLI tool | Node.js 18+ with TypeScript |
| Shell hooks | Zsh precmd/preexec hooks + Bash DEBUG trap and PROMPT_COMMAND |
| Memory storage | Supermemory Local (npx supermemory setup) |
| Supermemory SDK | @supermemory/client (official JS SDK) |
| Landing page | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | motion/react (Framer Motion) |
| Icons | Lucide React |
| Package distribution | npm global install |

No backend server required. Supermemory Local runs on the user's machine and Mnemix talks to it over localhost. The landing page is a static site deployed to Vercel.

---

## Project Structure

```
mnemix/
├── packages/
│   ├── cli/                          (the Node.js CLI tool)
│   │   ├── src/
│   │   │   ├── index.ts              (CLI entry point, bin field target)
│   │   │   ├── commands/
│   │   │   │   ├── install.ts        (shell hook installer)
│   │   │   │   ├── list.ts           (list stored fixes)
│   │   │   │   ├── forget.ts         (remove a memory)
│   │   │   │   └── stats.ts          (storage stats)
│   │   │   ├── hooks/
│   │   │   │   ├── capture.ts        (command capture and exit code handler)
│   │   │   │   ├── search.ts         (Supermemory search on failure)
│   │   │   │   └── store.ts          (fix storage logic)
│   │   │   ├── shell/
│   │   │   │   ├── mnemix.zsh        (zsh hook template)
│   │   │   │   └── mnemix.bash       (bash hook template)
│   │   │   ├── lib/
│   │   │   │   ├── supermemory.ts    (Supermemory Local client config)
│   │   │   │   ├── git.ts            (git context helpers)
│   │   │   │   └── format.ts         (terminal output formatting)
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── landing/                      (the marketing landing page)
│       ├── public/
│       │   ├── hero.webp             (hero image: Google Flow Image 3 — user places here)
│       │   ├── logo.svg              (logo — user provides, comment slot until then)
│       │   └── favicon.ico           (favicon — user provides, comment slot until then)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   │   ├── FadeIn.tsx
│       │   │   │   ├── BlurText.tsx
│       │   │   │   ├── GrainOverlay.tsx
│       │   │   │   └── Magnet.tsx
│       │   │   ├── layout/
│       │   │   │   └── Nav.tsx
│       │   │   └── sections/
│       │   │       ├── Hero.tsx
│       │   │       ├── TerminalMoment.tsx
│       │   │       ├── ThreePillars.tsx
│       │   │       ├── Setup.tsx
│       │   │       ├── Faq.tsx
│       │   │       └── Footer.tsx
│       │   ├── hooks/
│       │   │   ├── useScrollReveal.ts
│       │   │   └── useParallax.ts
│       │   ├── styles/
│       │   │   └── globals.css
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── tsconfig.json
└── README.md
```

---

## Design System

All design decisions are confirmed across seven gates. Do not deviate from any value below.

**Aesthetic:** Dark editorial with terminal flavour

**Fonts:**
- Display: Source Serif 4 (variable optical size)
- Body: Be Vietnam Pro
- Mono: Azeret Mono

Load via Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300&family=Be+Vietnam+Pro:wght@300;400;500;600&family=Azeret+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
```

**Colour palette — Phosphor Dusk:**
```css
--bg-primary:     #090b11;
--bg-secondary:   #0f1219;
--bg-surface:     #161b26;
--bg-elevated:    #1e2435;
--accent:         #72f0b4;
--accent-hover:   #9af7cc;
--accent-glow:    rgba(114, 240, 180, 0.10);
--accent-dim:     #2a7a5a;
--text-primary:   #e4eaf5;
--text-secondary: #6a7a96;
--text-muted:     #2e3a52;
--border-subtle:  rgba(255, 255, 255, 0.04);
--border-default: rgba(255, 255, 255, 0.08);
--success:        #22c55e;
--error:          #ef4444;
```

**Nav:** Fixed liquid-glass pill floating above the hero. Mnemix wordmark left, single "Install Mnemix" CTA right. No centre links, no login, no sign up.

**Hero background:** Google Flow Image 3 (liquid obsidian diamond centered on dark slate rock, 16:9, near-black atmospheric void in upper 50%). Full-bleed. No colour overlay. Dark gradient from lower 35% upward to transparent. Copy centered horizontally in the dark void above the form. Noise grain SVG at 3.5% over entire frame. Mouse parallax on image layer only, text layer stays fixed.

**Liquid glass classes** (defined in globals.css):
```
.liquid-glass
.liquid-glass-strong
.liquid-glass-dark
```

**Noise grain overlay** (applied via `GrainOverlay.tsx`, fixed position, z-index 50):
```css
opacity: 0.035;
background-image: url("data:image/svg+xml,...fractalNoise...");
background-size: 128px 128px;
```

---

## Landing Page Sections (in order)

1. **Hero** — full viewport, Google Flow Image 3 full-bleed, copy centered over dark void above diamond. Eyebrow label in accent Azeret Mono, Source Serif 4 headline two lines, Be Vietnam Pro one-liner, Azeret Mono install command with copy button, primary CTA pill. Mouse parallax on image layer
2. **Terminal moment** — framed terminal window mockup. macOS-style title bar, three muted window dots, Azeret Mono showing a failed command then Mnemix surfacing the fix inline. No explanation needed, the sequence speaks for itself
3. **Three pillars** — left-anchored Source Serif 4 large heading, three feature cards flowing right and below. Cards: Silent (zero latency, background daemon), Semantic (searches meaning not keywords), Local (no cloud, no account, your data stays on your machine). 3D card tilt on hover
4. **Setup** — two numbered steps. Step 1: `npx supermemory setup`. Step 2: `npm install -g mnemix && mnemix install`. Nothing else
5. **FAQ** — accordion, six questions, full-width rows. Question text left, `+` icon right, rotates to `×` on open, height animates open. Questions listed in Code Rules section below
6. **Footer** — Mnemix wordmark, GitHub repo link, "Built on Supermemory Local" attribution, tagline in Azeret Mono

---

## Logo and Favicon

No logo or favicon exists yet. Leave both as plain text comment slots:

```tsx
{/* Logo slot: replace with public/logo.svg once provided */}
```

```html
<!-- Favicon slot: replace with public/favicon.ico once provided -->
```

Never substitute a hardcoded placeholder, an AI-generated icon symbol or an emoji in either slot.

---

## Supermemory Local Integration

Mnemix connects to Supermemory Local which runs at `http://localhost:3000` by default after `npx supermemory setup`. All memory operations go through this local endpoint. No API key is needed for local deployments. If the server is not running, Mnemix degrades gracefully: commands are still captured in a local queue and synced once the server comes back up.

```typescript
/**
 * Initialises the Supermemory Local client for Mnemix.
 * Connects to the local server running on the user's machine.
 * Falls back silently if the server is not reachable.
 * @returns configured Supermemory client instance
 */
import Supermemory from '@supermemory/client'

export const supermemory = new Supermemory({
  baseUrl: process.env.SUPERMEMORY_URL ?? 'http://localhost:3000',
  apiKey: 'local',
})
```

**Memory document shape for stored fixes:**
```typescript
interface FixMemory {
  command: string          // the command that failed
  errorSnippet: string     // first 300 chars of stderr output
  fix: string              // the command that resolved it
  directory: string        // working directory at time of failure
  gitBranch?: string       // git branch if inside a repo
  resolvedAt: number       // unix timestamp of the fix
}
```

**Container tag:** All Mnemix memories are stored under the container tag `mnemix-fixes` so they are isolated from any other Supermemory usage on the same machine.

---

## Shell Hook Logic

### Zsh hooks

```zsh
# .mnemix/mnemix.zsh
# Source this file from .zshrc via: source ~/.mnemix/mnemix.zsh

_mnemix_last_command=""
_mnemix_last_start=0

preexec() {
  _mnemix_last_command="$1"
  _mnemix_last_start=$SECONDS
}

precmd() {
  local exit_code=$?
  if [[ $exit_code -ne 0 && -n "$_mnemix_last_command" ]]; then
    mnemix capture \
      --command "$_mnemix_last_command" \
      --exit-code "$exit_code" \
      --directory "$PWD" \
      --git-branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  fi
}
```

### Bash hooks

```bash
# .mnemix/mnemix.bash
# Source this file from .bashrc via: source ~/.mnemix/mnemix.bash

_mnemix_last_command=""

_mnemix_preexec() {
  _mnemix_last_command="$BASH_COMMAND"
}
trap '_mnemix_preexec' DEBUG

_mnemix_precmd() {
  local exit_code=$?
  if [[ $exit_code -ne 0 && -n "$_mnemix_last_command" ]]; then
    mnemix capture \
      --command "$_mnemix_last_command" \
      --exit-code "$exit_code" \
      --directory "$PWD" \
      --git-branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  fi
}
PROMPT_COMMAND="_mnemix_precmd${PROMPT_COMMAND:+; $PROMPT_COMMAND}"
```

---

## Code Rules (follow without exception)

**TypeScript / Node.js:**
- camelCase for all variables and functions
- JSDoc comments on every function and custom hook
- No inline styles in React unless a CSS variable or dynamic value requires it
- CSS variables from the design system used directly in components, never hardcoded hex values
- No hardcoded placeholder logos, favicons or icon symbols. Logo and favicon slots are comments only
- No AI-generated icon symbols or emoji used as visual accents anywhere in the landing page

**Writing rules (apply to all copy, labels, CLI output, code comments, JSDoc, README):**
- British English throughout
- No em dashes anywhere
- Periods only when necessary
- Commas only when necessary
- Short direct sentences
- No filler phrases: no "seamlessly", "powerful", "robust", "leverage", "cutting-edge", "unlock"
- CLI output is minimal and precise: no celebration emoji, no ASCII art, no excessive colour
- CTA text is direct: "Install Mnemix", "Copy command", "View on GitHub"
- Error messages are plain and helpful: "Supermemory Local is not running. Start it with: npx supermemory setup"
- Empty states are honest: "No fixes stored yet. Run a few commands and Mnemix will start learning"

**Component rules:**
- CSS class-based hover states only. No inline JS onMouseEnter or onMouseLeave handlers
- Framer Motion for all entrance animations, imported from `motion/react`
- Blur-in entrance: `initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}` with `animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}`
- Stagger sequences via Framer Motion `staggerChildren` on container
- Loading states use skeleton shimmer, not spinners
- Magnetic hover on CTA uses `useMotionValue` and `useTransform`, never `useState` for cursor position
- 3D card tilt uses `useMotionValue`, `useTransform` and `useSpring`
- Mouse parallax on hero uses `useMotionValue` and `useTransform`, wrapped in a static `overflow: hidden` parent

**FAQ questions (in order):**
1. Does Mnemix support bash, zsh and fish?
2. Does my command history ever leave my machine?
3. Do I need Supermemory Local running all the time or just when I use Mnemix?
4. What happens when I run a command Mnemix has never seen before?
5. Can I use Mnemix without an internet connection?
6. How does Mnemix decide which past fix is relevant?

**Never do these:**
- Never send command data or fix data to any remote server
- Never store the full stderr output beyond the first 300 characters
- Never run `console.log` in production CLI paths
- Never add any branding, logos or icons that the user has not provided
- Never use `localStorage` or `sessionStorage` in the landing page
- Never use JetBrains Mono anywhere in this project

---

## Hackathon Checklist

- Project name: Mnemix
- Hackathon: Supermemory Local Hackathon (localhost:6767)
- Submission deadline: Sunday July 13 2026, 23:59 PST
- Google Form submission mandatory: https://forms.gle/ARXHNpFY5VNfiNDBA
- Post in #project-showcase on the Supermemory Discord using the pinned template
- Public GitHub repo required
- Demo video required, maximum 3 minutes
- Supermemory Local must be meaningfully used, not decorative
- No pre-built products rebadged. Fresh code only, boilerplate and libraries are fine
