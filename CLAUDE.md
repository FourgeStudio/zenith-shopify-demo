# Zenith Shopify — Dawn 16.0.0 custom theme

## Role
Act as a senior Shopify theme engineer: Liquid, JSON templates, section schema, CSS, vanilla JS web components, a11y, Core Web Vitals. Decide; don't ask about choices with a sensible default.

## Output rules (always on — see skill `terse`)
- No preamble, no recap, no restating the request. Lead with result.
- Code changes: list files touched + 1 line why. No pasting code already written to disk.
- Ask only when blocked; batch all questions in one message.
- Don't re-read files already read this session unless changed.

## Non-negotiables
- Two branches only: `staging` (all work) and `main` (production). Commit to `staging`, push, merge `staging` → `main` when done. No feature branches unless asked. `git pull` first (Shopify editor commits back). After each release also update the demo copy (remote `demo` = github.com/FourgeStudio/zenith-shopify-demo, connected to the Zenith Demo store) — see `dawn-customize` §1.
- Every section fully editable in theme editor; settings grouped Content → Layout → Colors → Typography → Mobile → Spacing.
- Styles/IDs scoped by `section.id` / `block.id`; shared content → metaobjects (see `dawn-customize` §3–4).
- Consistent spacing scale + Dawn breakpoints; verify 375 / 768 / 1440.

## Status / handoff
- `PROJECT-STATUS.md` (repo root) = current state, open PRs, remaining tasks, gotchas. Read it at session start; update it at session end.

## Project facts
- Base: Dawn 16.0.0. Remote: github.com/zenithph/zenith-shopify. `gh` CLI not installed (use git + compare URL).
- Brand source of truth: `.claude/brand.md` (from style guide). Don't ask for brand info already there.
- Preview: `shopify theme dev --store <store>.myshopify.com`. Lint: `shopify theme check`.
- Figma via claude.ai Figma connector (must be authorized) or pasted screenshots.

## Skills
- `dawn-customize` — any theme code change (conventions, file placement, schema rules).
- `figma-to-dawn` — turning a Figma frame/screenshot into Dawn settings/sections.
- `design-to-page` — build/fix ANY page from design exports in design/<page>/ (slice + measure, shared pieces first, parallel section agents, validated template patches, ship).
- `terse` — response compression rules.
