## Audit of what's available

**Heroes**
- `hero.tsx` (current) — centered 3-line H1 + shorten input. Functional but text-only, white bg, no color.
- `hero-01.tsx` — centered display H1 with `TextRotator` + `PartnerLogoGrid`. Great motion + social proof, but loses the shorten input.
- `hero-02.tsx` — left-aligned eyebrow + heading + dual CTA + logo strip under a divider. Editorial feel.
- `hero-03.tsx` — announcement pill badge + huge left heading + 3-col row (CTAs · spacer · right-aligned subtitle). Most distinctive, breaks the symmetric-center trap.

**Feature showcases**
- `feature-showcase.tsx` (current) — pill tabs + browser-chrome mockup. Static, one screen at a time.
- `feature-showcase-01.tsx` — autoplay tabs with animated progress bar, pause/play. Much more alive.
- `feature-showcase-02.tsx` — scroll-driven pinned section, bars fill as you scroll. Signature moment.
- `features-03.tsx` — text feature list variant.
- `bento-features.tsx` (current) — 4 tiny bordered squares. Weakest section, feels like filler.

**Testimonials**
- `testimonials.tsx` (current) — plain grid.
- `testimonial-01.tsx` — full-bleed image quote cards in a slider (`QuoteCard` with `backgroundImage`). Uses our rich `quoteTestimonials` (8 with Unsplash imagery). Big color/texture win.
- `testimonial-02.tsx` — giant single crossfading pull-quote with autoplay nav. Cinematic.
- `testimonial-03.tsx` — 3-up avatar cards slider.

**CTAs**
- `cta-banner.tsx` (current) — centered text, white.
- `cta-03.tsx` — rounded primary-color banner (dark colored block, white text, shadow-2xl). Adds the color the page is missing.
- `cta-04.tsx` — full-bleed primary band.

## Proposed polished composition

Swap in the richer variants, introduce color/texture via a dark CTA block, image-backed testimonial slider, and a scroll-pinned feature showcase between them. Keep our current `Hero` (it owns the primary "shorten a URL" conversion — do not lose the input), but wrap it in a subtle tinted/gradient surface so it stops reading as flat white.

```text
┌────────────────────────────────────────────────────────────────┐
│  Header  [LinkShort]                              [Sign in]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ░░░ subtle radial gradient + grid texture (primary/5) ░░░    │
│                                                                │
│                Shorten links.                                  │
│                Share them anywhere.                            │
│                See every click.                                │
│                                                                │
│         Clean URL shortening for makers & solo operators.      │
│                                                                │
│   ┌──────────────────────────────────────┐  ┌──────────────┐   │
│   │  https://paste-your-long-url…       │  │  Shorten →   │   │
│   └──────────────────────────────────────┘  └──────────────┘   │
│                                                                │
│   ── trusted by ──────────────────────────────────────────     │
│   [vercel] [stripe] [supabase] [cursor] [raycast] [posthog]    │
│   [webflow] [resend] [clerk] [asana] [slack] [sanity] …        │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS   (feature-showcase-01: autoplay tabs)           │
│                                                                │
│    Three steps to every short link                             │
│                                                                │
│    [● Shorten ▓▓▓▓▓░]  [ Customize ]  [ Analyze ]              │
│                                                                │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ ● ● ●     lnk.sh/dashboard                           │    │
│    ├──────────────────────────────────────────────────────┤    │
│    │                                                      │    │
│    │        (large product mockup, crossfades)            │    │
│    │                                                      │    │
│    └──────────────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────────────┤
│  TESTIMONIALS   (testimonial-01: image-backed quote slider)    │
│                                                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │▓image▓ │ │▓image▓ │ │▓image▓ │ │▓image▓ │                   │
│  │"A wk-  │ │"Cycles │ │"Repl-  │ │"Gover- │  ← → ▓▓▓░ ⏸       │
│  │ long   │ │ short- │ │ aced 6 │ │ nance  │                   │
│  │ report │ │ ened   │ │ tools" │ │ sold   │                   │
│  │ in 4h" │ │ 30%"   │ │        │ │ us"    │                   │
│  │ GC,Fin │ │ CRO    │ │ Head Op│ │ CISO   │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│    ╭──────────────────────────────────────────────────────╮    │
│    │  ████ PRIMARY-COLOR ROUNDED BANNER (cta-03) ████     │    │
│    │                                                      │    │
│    │        Your links. Your data. No bloat.              │    │
│    │                                                      │    │
│    │        Ship faster with links that actually          │    │
│    │        tell you what happened after the click.       │    │
│    │                                                      │    │
│    │        [ Get started free ]    Sign in →             │    │
│    │                                                      │    │
│    ╰──────────────────────────────────────────────────────╯    │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Footer                                                        │
└────────────────────────────────────────────────────────────────┘
```

## Concrete swaps

1. **Hero** — keep current `Hero` (URL input is the conversion). Add a background layer: subtle radial gradient in primary/5 + faint grid pattern so it's no longer flat white. Move the partner logo grid from Hero01 into this hero, below the input (removes the need for a separate trust strip).
2. **Feature showcase** — replace static `feature-showcase.tsx` with `feature-showcase-01` (autoplay tabs + progress bar) wired to the existing `useFeatureTabs` data and `ShortenMockup / CustomizeMockup / AnalyzeMockup`.
3. **Delete `BentoFeatures`** from the page — it's the weakest module and the autoplay showcase already covers the "what it does" job.
4. **Testimonials** — replace grid `Testimonials` with `Testimonial01` fed by the existing `quoteTestimonials` (8 image-backed quotes we already ship). This alone adds most of the color/texture the page is missing.
5. **CTA** — replace `cta-banner.tsx` with `Cta03` (rounded primary-color block, shadow-2xl). Reuses `Cta03` verbatim with our current copy.
6. **Section rhythm** — alternate surface colors so it doesn't read as one white sheet: hero (tinted) → showcase (background) → testimonials (muted/5) → CTA (primary block) → footer.

## Technical notes

- All swaps are compositional: edit `src/pages/landing/index.tsx` to import `Hero`, `FeatureShowcase01`, `Testimonial01`, `Cta03`, `Footer`. Wire props from existing data (`useFeatureTabs`, `quoteTestimonials`, `partnerLogos`).
- Hero background: add a wrapper div inside `hero.tsx` with `bg-[radial-gradient(...)]` using primary token + an SVG grid via `bg-[url(...)]`. No new tokens.
- Section-level tints via `bg-muted/40` on testimonials wrapper; primary block already handled by `cta-03`.
- No new deps, no data model changes.

## Out of scope

- New copy or new imagery beyond what `src/data/landing.ts` already has.
- Dark mode retune (style-pack tokens unchanged).
- Header/nav restructure.
