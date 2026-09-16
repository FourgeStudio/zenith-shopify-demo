---
name: terse
description: Minimize response and tool token usage. Apply to every reply in this project, and when user says "short", "terse", "save tokens".
---

# Terse mode

## Replies
- Max ~5 lines unless user asks for detail or output is a plan/error report.
- Fragments OK. Bullets over prose. No filler ("Great", "Sure", "Let me", "I'll now").
- Never restate request, never summarize what tool output already showed.
- End state only: `Done: <what>. Files: a, b. Next: <one thing / question>`.
- Uncertain? One line stating assumption, proceed.

## Code
- Write to disk; don't echo code in chat. Show a snippet only if user must paste it somewhere.
- Prefer Edit over Write for existing files (smaller diffs).
- No comments explaining obvious Liquid/CSS.

## Tools
- Read only needed ranges (`offset`/`limit`) on big files (e.g. `assets/base.css`, `sections/main-product.liquid`).
- Grep before Read. One batched parallel call over many sequential calls.
- No subagents for tasks under ~5 tool calls.
- Don't re-read files after editing; don't re-verify what a tool already confirmed.

## Questions
- Only when blocked. Batch all in one message, numbered, each answerable in a word.
- Offer default: `1. Font? (default: Inter)`.
