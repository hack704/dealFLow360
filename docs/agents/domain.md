# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the glossary and domain model for DealFlow360.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
dealFLow360/
├── CONTEXT.md          ← domain glossary & bounded contexts
├── CLAUDE.md           ← agent instructions (this file's parent)
├── docs/
│   ├── agents/         ← agent skill config (issue-tracker, triage-labels, domain)
│   ├── adr/            ← architectural decision records
│   └── architecture.md ← existing high-level architecture document
├── client/             ← React 18 SPA
└── server/             ← Express REST API
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

Key domain terms already in use across this codebase:

| Term | Meaning |
|---|---|
| **Quotation** | A CPQ deal record (not "quote" or "proposal") |
| **CPQ** | Configure, Price, Quote — the core workflow |
| **Blended Margin** | Weighted average margin across all line items in a quotation |
| **Risk Score** | Composite deal health score 0–100 |
| **Approval Level** | L1 (Manager), L2 (Finance), L3 (VP/CFO) |
| **Line Item** | A single product + quantity + discount entry within a quotation |
| **Engine** | A pure business-logic module in `server/src/services/*/` |
| **Proration** | Mid-cycle subscription billing adjustment |

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
