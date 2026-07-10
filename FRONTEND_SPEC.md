# Mnemix — Frontend Spec

## Overview

This document is the authoritative frontend specification for the Mnemix landing page. It exists alongside CLAUDE.md and BUILD_GUIDE.md. CLAUDE.md holds design system values and code rules. BUILD_GUIDE.md holds component build order and implementation detail. This file holds the complete visual and interaction specification for every section of the page, written to be passed directly to a coding agent.

Read all three files before writing any component.

---

## Global Rules

Every rule below applies across the entire page without exception.

**Typography scale:**
```
display-xl:  font-serif, 5rem (80px) / 1.05 leading, font-weight 400, md: 7rem (112px)
display-lg:  font-serif, 3rem (48px) / 1.1 leading, font-weight 400
heading:     font-sans, 1.25rem (20px) / 1.3 leading, font-weight 500
body-lg:     font-sans, 1.125rem (18px) / 1.6 leading, font-weight 300
body:        font-sans, 1rem (16px) / 1.6 leading, font-weight 400
body-sm:     font-sans, 0.875rem (14px) / 1.6 leading, font-weight 300
mono:        font-mono, 0.875rem (14px) / 1.5 leading, font-weight 400
label:       font-mono, 0.75rem (12px) / 1 leading, font-weight 400, tracking: 0.15em, uppercase
```

**Spacing tokens (use these, not arbitrary values):**
```
xs:   0.25rem  (4px)
sm:   0.5rem   (8px)
md:   1rem     (16px)
lg:   1.5rem   (24px)
xl:   2rem     (32px)
2xl:  3rem     (48px)
3xl:  4rem     (64px)
4xl:  6rem     (96px)
5xl:  8rem     (128px)
```

**Radius tokens:**
```
sm:   0.375rem  (6px)
md:   0.75rem   (12px)
lg:   1rem      (16px)
xl:   1.5rem    (24px)
pill: 9999px
```

**Transition standard:**
```
fast:    120ms ease
default: 220ms ease
slow:    400ms cubic-bezier(0.16, 1, 0.3, 1)
```

**Animation entrance standard (all below-fold elements):**
```
initial:   { opacity: 0, filter: 'blur(8px)', y: 20 }
animate:   { opacity: 1, filter: 'blur(0px)', y: 0 }
viewport:  { once: true, margin: '-80px' }
transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
```

**Stagger containers:** `staggerChildren: 0.08` on parent, children use `variants`

**Import path for Framer Motion:** `import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react'`

**No inline styles except:** dynamic values from `useMotionValue` or `useTransform`, and `style={{ color: '#ef4444' }}` for error text in the terminal mockup.

**No onMouseEnter / onMouseLeave for styling.** CSS class transitions only.

**No JetBrains Mono.** Every mono instance uses Azeret Mono.

**No logo or favicon.** Both are comment placeholder slots until Paul provides the asset.

---

## Section 1 — Nav

**Component:** `src/components/layout/Nav.tsx`

**Behaviour:** Fixed position, floating above the page. Does not push content down. Centers horizontally.

**Dimensions:** auto height, max-width 640px on desktop, margin-inline auto, top 24px, left 50%, transform translateX(-50%)

**Structure:**
```
<header> (fixed, top-6, left-1/2, -translate-x-1/2, z-[100], w-full, max-w-2xl, px-4)
  <nav> (.liquid-glass, rounded-pill, px-5, py-3, flex, items-center, justify-between)
    <div> logo left
      {/* Logo slot: replace with public/logo.svg once provided */}
      <span> "Mnemix" — font-serif, text-lg, text-primary, font-weight 400
    <a href="#install"> (CTA)
      "Install Mnemix"
      rounded-pill, bg-accent, text-bg-primary, font-sans text-sm font-medium
      px-4 py-2
      hover:bg-accent-hover transition-default
```

**Scroll behaviour:** No change on scroll. The liquid-glass pill already handles visual separation from the hero below.

---

## Section 2 — Hero

**Component:** `src/components/sections/Hero.tsx`

**Dimensions:** 100dvh, position relative, overflow hidden

**Layer 1 — Hero image (parallax):**
```
<motion.div> (absolute inset-0, style={{ x, y }} from useParallax(12))
  <img
    src="/hero.webp"
    alt=""
    aria-hidden="true"
    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
  />
```

Image: Google Flow output — liquid obsidian diamond on dark slate, centered, 16:9, near-black void in upper 50%.

The parallax parent must have `overflow: hidden` applied so the shifted image never exposes edge gaps.

**Layer 2 — Gradient veil:**
```
<div> (absolute, inset-0, pointer-events-none)
  background: linear-gradient(
    to top,
    var(--bg-primary) 0%,
    rgba(9, 11, 17, 0.55) 35%,
    transparent 65%
  )
```

**Layer 3 — Grain:**
```
<GrainOverlay /> (fixed, not absolute — covers the entire viewport, not just the hero)
```

**Layer 4 — Content:**
```
<div> (absolute inset-0, flex items-center justify-center, z-10)
  <div> (text-center, max-w-2xl, px-6, flex flex-col items-center, gap-6)

    <motion.span> (FadeIn, delay 0)
      label style: font-mono text-[12px] tracking-[0.15em] uppercase text-accent
      "shell memory daemon"

    <motion.h1> (FadeIn, delay 0.1)
      font-serif display-xl text-primary text-center
      line 1: "Your terminal remembers."
      <br />
      line 2: "You never repeat yourself."

    <motion.p> (FadeIn, delay 0.2)
      font-sans body-lg text-secondary text-center max-w-md
      "Mnemix hooks into your shell and surfaces fixes from your own history the moment a command fails."

    <motion.div> (FadeIn, delay 0.3) — install command block
      id="install"
      .liquid-glass-dark rounded-lg px-5 py-3.5
      flex items-center justify-between gap-4 min-w-[320px]
      <code> font-mono text-sm text-primary
        "npm install -g mnemix && mnemix install"
      <button> (copy icon, Lucide Copy 16px, text-secondary)
        hover:text-accent transition-fast
        On click: copies text, swaps icon to Lucide Check, reverts after 1500ms

    <motion.div> (FadeIn, delay 0.4) — CTA
      <Magnet>
        <button>
          "Install Mnemix"
          font-sans text-sm font-medium
          bg-accent text-bg-primary
          rounded-pill px-6 py-3
          hover:bg-accent-hover transition-default
```

**No scroll indicator. No animated arrow. No "↓ scroll" copy.** The hero ends cleanly.

---

## Section 3 — Terminal Moment

**Component:** `src/components/sections/TerminalMoment.tsx`

**Purpose:** Shows a judge exactly what Mnemix does in under five seconds without any explanatory copy beyond the terminal output itself.

**Section wrapper:**
```
<section> bg-secondary, py-5xl, px-4
  max-w-3xl mx-auto
  flex flex-col items-center gap-2xl
```

**Heading block (FadeIn):**
```
<div> text-center
  <h2> display-lg font-serif text-primary
    "The fix is already in your history."
  <p> body text-secondary mt-md max-w-sm mx-auto
    "Mnemix searches what you have already solved. Not the internet."
```

**Terminal frame (FadeIn, delay 0.15):**
```
<div>
  max-w-[720px] w-full
  rounded-xl overflow-hidden
  border border-[var(--border-default)]
  shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.5)

  Title bar:
    bg-[var(--bg-surface)]
    px-4 py-3
    flex items-center gap-2
    border-b border-[var(--border-subtle)]

    Three window dots (div, w-3 h-3 rounded-full):
      dot 1: background #3a3a3a
      dot 2: background #4a4a4a
      dot 3: background #5a5a5a

    Title text (span, font-mono text-xs text-muted ml-2):
      "bash — mnemix"

  Terminal body:
    bg-[var(--bg-elevated)]
    p-6
    font-mono text-sm
    leading-7

    Line 1:
      <span class="text-muted">$ </span>
      <span class="text-primary">git pull origin main</span>

    Line 2:
      <span style={{ color: '#ef4444' }}>error: Your local changes would be overwritten by merge</span>

    Line 3:
      <span style={{ color: '#ef4444' }}>Please commit your changes or stash them before you merge.</span>

    Line 4: empty line (mb-2)

    Line 5:
      <span class="text-accent">mnemix › found 1 match from 3 weeks ago</span>

    Line 6:
      <span class="text-primary">fix: git stash && git pull origin main</span>

    Line 7:
      <span class="text-muted">context: ~/projects/api · branch: main</span>
```

All text in the terminal body is static. No typewriter animation, no cursor blink. Static is the right choice here: a judge pausing the video can read every line. A typewriter risks cutting off mid-sequence.

---

## Section 4 — Three Pillars

**Component:** `src/components/sections/ThreePillars.tsx`

**Section wrapper:**
```
<section> bg-primary, py-5xl, px-4
  max-w-6xl mx-auto
```

**Layout:** Two-column at `lg` breakpoint. Left column is sticky at `top: 8rem` on desktop. Right column holds the three cards in a single column.

**Left column (FadeIn):**
```
<div> lg:sticky lg:top-32 lg:self-start
  <h2> display-lg font-serif text-primary max-w-xs leading-tight
    "Silent. Semantic. Local."
  <p> body text-secondary mt-lg max-w-xs
    "Three principles that make Mnemix different from every other shell history tool."
```

**Right column — three cards:**

Each card is a separate `TiltCard` sub-component implementing 3D tilt.

**TiltCard implementation:**
```typescript
/**
 * Renders a feature card with 3D tilt on hover.
 * Uses motion values for smooth cursor-tracked rotation.
 * Returns to flat when cursor leaves.
 * @param title - card heading
 * @param body - card description
 */
function TiltCard({ title, body }: { title: string; body: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-6"
    >
      <h3 className="font-sans text-lg font-medium text-[var(--text-primary)] mb-3">{title}</h3>
      <p className="font-sans text-sm font-light text-[var(--text-secondary)] leading-relaxed">{body}</p>
    </motion.div>
  )
}
```

CSS for hover border shift (in globals.css, class-based only):
```css
.tilt-card {
  transition: border-color 220ms ease;
}
.tilt-card:hover {
  border-color: var(--accent-dim);
}
```

**Three card data:**

Card 1:
- Title: `Silent`
- Body: `Runs as a shell hook with no perceived latency. Nothing blocks your prompt. You will not notice it until you need it.`

Card 2:
- Title: `Semantic`
- Body: `Searches by meaning, not keywords. A different error message for the same underlying problem still matches the fix you already know.`

Card 3:
- Title: `Local`
- Body: `Your command history never leaves your machine. Supermemory Local runs the full memory layer on your laptop. No account, no cloud, no tracking.`

Cards use FadeIn with stagger: delays 0, 0.08, 0.16.

---

## Section 5 — Setup

**Component:** `src/components/sections/Setup.tsx`

**Section wrapper:**
```
<section id="install"> bg-secondary, py-5xl, px-4
  max-w-2xl mx-auto
  text-center
```

**Section heading (FadeIn):**
```
<h2> display-lg font-serif text-primary mb-3xl
  "Up in two steps."
```

**Step component:**

Each step is a `SetupStep` sub-component:
```typescript
/**
 * Renders a numbered setup step with a copy-able command block.
 * Handles copy state internally with a 1500ms revert timer.
 * @param number - step label string e.g. "step 01"
 * @param heading - step title
 * @param command - the command to display and copy
 * @param note - descriptive note below the command
 */
```

Step layout:
```
<div> text-left, border-t border-[var(--border-subtle)], pt-xl, mb-xl

  <span> label style: font-mono text-[12px] tracking-[0.15em] uppercase text-accent
    e.g. "step 01"

  <h3> font-sans text-lg font-medium text-primary mt-sm mb-lg
    e.g. "Start Supermemory Local"

  Command block:
    .liquid-glass-dark rounded-lg px-5 py-3.5
    flex items-center justify-between gap-4
    <code> font-mono text-sm text-primary flex-1
      e.g. "npx supermemory setup"
    <button> (Lucide Copy 16px / Lucide Check 16px)
      text-secondary hover:text-accent transition-fast
      On click: copy, swap icon, revert after 1500ms

  <p> font-sans text-sm font-light text-muted mt-md
    e.g. note text
```

**Step 1 data:**
- Label: `step 01`
- Heading: `Start Supermemory Local`
- Command: `npx supermemory setup`
- Note: `Runs the full memory layer on your machine. One command, nothing else needed.`

**Step 2 data:**
- Label: `step 02`
- Heading: `Install Mnemix`
- Command: `npm install -g mnemix && mnemix install`
- Note: `Hooks into your shell. Restart your terminal once and it runs from that point forward.`

FadeIn stagger on each step: delays 0, 0.1.

---

## Section 6 — FAQ

**Component:** `src/components/sections/Faq.tsx`

**Section wrapper:**
```
<section> bg-primary, py-5xl, px-4
  max-w-2xl mx-auto
```

**Section heading (FadeIn):**
```
<h2> display-lg font-serif text-primary mb-3xl text-center
  "Common questions."
```

**FAQ list:**

State: `const [openIndex, setOpenIndex] = useState<number | null>(null)`

Clicking a closed item sets `openIndex` to its index. Clicking the open item sets `openIndex` to `null`.

**Each FAQ row:**
```
<div> border-b border-[var(--border-subtle)]

  <button>
    w-full flex items-center justify-between py-5 cursor-pointer
    text-left
    onClick toggles open state

    <span> font-sans text-base text-primary
      question text

    <motion.div>
      animate={{ rotate: openIndex === i ? 45 : 0 }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
      <Plus size={20} className="text-secondary" />

  <AnimatePresence initial={false}>
    {openIndex === i && (
      <motion.div>
        key={i}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}

        <p> font-sans text-sm font-light text-secondary leading-relaxed pb-5
          answer text
    )}
  </AnimatePresence>
```

Note: use a rotating `Plus` icon (45 degrees = `×` visual) rather than swapping between `Plus` and `X` components. This avoids layout shift from icon size differences.

**Six FAQ items:**

```
Q1: Does Mnemix support bash, zsh and fish?
A1: Mnemix supports zsh and bash at launch. Fish shell support is on the roadmap but is not in the current release.

Q2: Does my command history ever leave my machine?
A2: No. Mnemix writes everything to Supermemory Local which runs entirely on your machine. No data is sent to any remote server.

Q3: Do I need Supermemory Local running all the time or just when I use Mnemix?
A3: Supermemory Local needs to be running for Mnemix to store and search fixes. If it is not running, Mnemix degrades silently and queues captures locally until the server is back up.

Q4: What happens when I run a command Mnemix has never seen before?
A4: Nothing. Mnemix is silent when it has no relevant match. Your terminal behaves exactly as it would without Mnemix installed.

Q5: Can I use Mnemix without an internet connection?
A5: Yes. Supermemory Local and Mnemix both run entirely offline. An internet connection is only needed to install the packages initially.

Q6: How does Mnemix decide which past fix is relevant?
A6: It uses Supermemory Local's semantic search which compares the meaning of the failing command and error output against stored fixes. Only matches above a relevance threshold are shown. Low-confidence results are discarded silently.
```

---

## Section 7 — Footer

**Component:** `src/components/sections/Footer.tsx`

**Section wrapper:**
```
<footer> bg-primary, border-t border-[var(--border-subtle)]
  py-3xl px-4
  max-w-6xl mx-auto
  flex flex-col items-center gap-lg
```

**Row 1 — Wordmark:**
```
{/* Logo slot: replace with public/logo.svg once provided */}
<span> font-serif text-xl text-primary
  "Mnemix"
```

**Row 2 — Links:**
```
<div> flex items-center gap-md
  <a href="https://github.com/[repo]" target="_blank" rel="noopener noreferrer">
    font-sans text-sm font-light text-secondary
    hover:text-primary transition-fast
    "View on GitHub"
  <span> text-muted "·"
  <a href="https://supermemory.ai" target="_blank" rel="noopener noreferrer">
    same style
    "Built on Supermemory Local"
```

**Row 3 — Tagline:**
```
<span> font-mono text-xs text-muted tracking-[0.1em]
  "your terminal remembers"
```

---

## Banned Patterns

The following must not appear anywhere in the landing page codebase:

- `JetBrains Mono` in any font declaration
- `localStorage` or `sessionStorage`
- `onMouseEnter` or `onMouseLeave` for styling logic
- Hardcoded hex colours in component files (use CSS variables)
- `console.log` in any component or hook
- Placeholder text: no "Lorem ipsum", no "Coming soon", no "TBD", no "Placeholder"
- Round vanity numbers: no "10,000+ developers", no "99.9% uptime"
- AI aesthetic symbols used as visual accents
- Gradient text on large headings
- Outer neon glows on elements
- Custom cursor overrides
- `<form>` HTML elements (use button with onClick)
- Any logo or favicon that is not provided by Paul. The slot must be a code comment
- Spinner loading states. Use skeleton shimmer or nothing

---

## Asset Checklist

| Asset | Location | Status |
|---|---|---|
| Hero image (16:9 landscape) | `public/hero.webp` | Paul to place Google Flow Image 3 here |
| Logo SVG | `public/logo.svg` | Paul to provide — comment slot until then |
| Favicon | `public/favicon.ico` | Paul to provide — comment slot until then |
| GitHub repo URL | Footer link href | Update once repo is created |
