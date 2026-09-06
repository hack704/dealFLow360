# DealFlow360 — Agent Instructions

DealFlow360 is an enterprise CPQ (Configure, Price, Quote) and Deal Lifecycle Management platform. It is a **monorepo** with two workspaces:

- `client/` — React 18 + Vite + Tailwind CSS single-page application
- `server/` — Node.js + Express REST API with MongoDB/Mongoose

Run both with `npm run dev` from the root. The server runs on port **5000**, the client on port **5173**.

## Agent skills

### Issue tracker

Issues for this repo live in GitHub Issues at `github.com/hack704/dealFLow360`. Use the `gh` CLI for all issue operations. See `docs/agents/issue-tracker.md`.

### Triage labels

Using the default five-label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` at the repo root and ADRs under `docs/adr/`. See `docs/agents/domain.md`.

## Key conventions

- **No Redux** — state is managed via React Context (`AuthContext`, `QuotationContext`, `ThemeContext`)
- **Thin controllers, fat engines** — all business logic lives in `server/src/services/*/` engines, not controllers
- **JWT auth** — `Authorization: Bearer <token>` header; token stored in `localStorage` as `dealflow_token`
- **In-memory MongoDB** for development (auto-started via `mongodb-memory-server` when `MONGODB_URI` is unset); seeded automatically on first boot
- **Role enum** (from `server/src/config/constants.js`): `sales_rep`, `sales_manager`, `finance`, `admin`, `customer`
- **Quotation status lifecycle**: `draft` → `pending_approval` → `approved` / `rejected` → `sent_to_customer` → `accepted` / `expired`
- **Approval thresholds**: L1 Sales Manager (discount > 15% or total > $50k), L2 Finance (discount > 25% or margin < 20%), L3 CFO (discount > 35%, margin < 10%, or total > $250k)
- Discount safety cap: **70%** maximum regardless of input
- When debugging port errors, run `npm run clean:ports` (kills 5000 & 5173) then `npm run dev`
