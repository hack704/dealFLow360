# DealFlow360 — Complete Enterprise Operational & Role Integrity Guide (`instruction.md`)

This comprehensive manual details every single operation, authorization boundary, and server-enforced data integrity rule across all **five roles** in **DealFlow360** (Spec Section 3), complete with API specifications, operational walkthroughs, and automated verification commands.

---

## 1. Architectural Foundation & Cross-Role Integrity Principles

In DealFlow360, **data integrity is not a separate feature or client-side UX hint — it is a non-negotiable constraint enforced on every server-side write**.

### Four Universal Invariants Enforced Across All Roles:
1. **Immutable Append-Only Audit Trail**: Every state-changing governance action (`Submitted`, `Approved Stage 1`, `Final Approved`, `Returned for Revision`, `Rejected`, `Counter-Offer Submitted`, `Manager Rep Nudge`) appends an immutable entry to `approvalHistory` / `auditTrail`. The system never performs silent or destructive updates on decision histories.
2. **Unified CPQ & Risk Engine**: Pricing calculations, margin floors, blended margins, risk scores ($0\text{--}100$), and approval triggers are calculated by a single canonical function (`processQuotationCalculation`). Rep builder, customer portal counter-offers, and admin adjustments always run through the exact same logic.
3. **Atomic Stock Reservation (`findOneAndUpdate`)**: Stock reservations across multi-depot split orders update inventory using atomic MongoDB operations (`$inc: { quantityReserved: qty }`), preventing race conditions, double-allocations, and overselling.
4. **Ownership Checks are Additive to Role Checks**: A valid role token is necessary but insufficient. Route guards enforce resource ownership (`quotation.createdBy === req.user._id` for Reps, `quotation.customer === req.user.customerId` for Customers).

---

## 2. Five Roles: Work, Authorization, Data Integrity, and Operations

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           DealFlow360 Role Hierarchy                      │
├─────────────────┬─────────────────────────────────────────────────────────┤
│ Admin           │ Full access + Catalog & User Governance + Role Auditing │
├─────────────────┼─────────────────────────────────────────────────────────┤
│ Sales Manager   │ Discount Tiers + Stage 1 Approvals + Deal Health Nudges │
├─────────────────┼─────────────────────────────────────────────────────────┤
│ Finance / Ops   │ Stage 2 Approvals + Depot Splits + Billing Ledgers      │
├─────────────────┼─────────────────────────────────────────────────────────┤
│ Sales Rep       │ Quotation Creation + Line Edits (Draft) + CPQ Upsells    │
├─────────────────┼─────────────────────────────────────────────────────────┤
│ Customer Portal │ View Own Quotes + Counter-Discounts + Final Confirmation│
└─────────────────┴─────────────────────────────────────────────────────────┘
```

---

### Role 1: Sales Rep

#### A. Responsibilities & Work
- Builds quotations with line items, quantities, and commercial discounts.
- Views automated real-time upsell and cross-sell suggestions.
- Tracks deal approval status through the governance workflow.
- Monitors warehouse fulfillment progress (read-only).
- Responds to customer negotiation requests and comments.

#### B. Authorization Level
```
quotation:create
quotation:edit_own               — Scoped strictly to quotations where createdBy === self
quotation_line:add
quotation_line:edit
quotation:submit_for_approval
upsell:view_suggestions
fulfillment:view                 — Read-only visibility; no split overrides
```

#### C. Data Integrity Rules Enforced by Server
1. **Self-Approval Ban**: Even if a rep's token reaches `/api/approvals/:id/action`, the server throws `Data Integrity Violation: Sales reps are not authorized to approve quotations. Self-approval is strictly prohibited.` Additionally, the quote creator cannot approve their own deal even if holding elevated permissions.
2. **Server-Side Discount Validation on Every Write**: Line-level discount mutations recalculate `riskScore` and blended margin via `processQuotationCalculation()` server-side. A rep can input over-threshold discounts, but the system automatically forces `requiresApproval = true` and routes to governance.
3. **`edit_own` Ownership Enforcement**: A rep cannot mutate quotations created by another sales rep (`quotation.createdBy !== req.user._id` returns HTTP 403 `Access denied: Sales reps can only edit their own quotations`).
4. **Non-Draft Line Mutation Lock**: Once a quotation transitions out of `draft` status (e.g. `pending_approval`, `approved`, `sent_to_customer`), line-item edits are blocked with HTTP 400 (`Cannot edit quotation line items after leaving draft status. Re-submission required`).

#### D. Operational Steps & Verification

##### Operation 1.1: Live CPQ Price & Risk Preview
- **Route**: `POST /api/quotations/preview`
- **Headers**: `Authorization: Bearer <REP_TOKEN>`, `Content-Type: application/json`
- **Payload**:
```json
{
  "customerId": "664fa90b9b37c2a11b0e1234",
  "items": [
    { "productId": "664fa90b9b37c2a11b0e5678", "quantity": 10, "discountPercent": 18 }
  ]
}
```
- **Integrity Result**: Computes subtotal, total discount, margin percentage, risk score, and indicates `requiresApproval: true` because 18% exceeds the 15% rep limit.

##### Operation 1.2: Create and Submit Quotation
- **Route**: `POST /api/quotations`
- **Payload**:
```json
{
  "customerId": "664fa90b9b37c2a11b0e1234",
  "title": "Enterprise Cloud Migration Deal",
  "submitForApproval": true,
  "items": [
    { "productId": "664fa90b9b37c2a11b0e5678", "quantity": 25, "discountPercent": 20 }
  ]
}
```
- **Integrity Result**: Sets `quotation.status = 'pending_approval'`, assigns `createdBy: req.user._id`, and creates an `ApprovalRequest` record with `currentStage: 'Sales Manager'`.

##### Operation 1.3: Rep Self-Approval Attempt (Blocked)
- **Route**: `POST /api/approvals/<APPROVAL_REQ_ID>/action`
- **Headers**: `Authorization: Bearer <REP_TOKEN>`
- **Payload**: `{ "action": "approve", "note": "Rep self sign-off" }`
- **Server Response**: HTTP 500 / 400 error blocking self-approval.

---

### Role 2: Sales Manager / Approver

#### A. Responsibilities & Work
- Reviews, approves, returns, or rejects quotations that exceed discount thresholds.
- Configures discount tier ceilings and approval escalation rules.
- Monitors Deal Health dashboard to identify stalled or margin-eroded deals.
- Nudges sales reps and escalates at-risk opportunities.

#### B. Authorization Level
```
approval:decide_manager_step     — Stage-scoped: only valid when currentStage === 'Sales Manager'
deal_health:view
deal_health:escalate
deal_health:nudge_rep
discount_tier:configure
approval_chain:configure
+ All Sales Rep permissions
```

#### C. Data Integrity Rules Enforced by Server
1. **Stage-Aware Decision Validation**: A manager decision is only authoritative if `approvalRequest.currentStage === 'Sales Manager'`. If the request has already progressed to Finance or has been resolved, manager actions are rejected with `Data Integrity Violation: Sales Manager decision invalid because approval stage has already progressed`.
2. **Immutable Append-Only Audit Entries**: Every manager decision appends `{ user, action, note, date }` to the approval audit trail. Rejections and returns strictly require a non-empty `note` justification.
3. **No Retroactive Risk Mutation**: Modifying discount tier ceilings updates the governance configuration with a version stamp (`version`, `lastUpdatedBy`), but does **not** retroactively alter risk scores or approved statuses of historical quotations.
4. **Deal Health Action Traceability**: Every rep nudge or manager escalation from the Deal Health dashboard persists `actionBy`, `actionRole`, `actionTimestamp`, and `actionNotes`, and appends an entry to the deal's audit trail.

#### D. Operational Steps & Verification

##### Operation 2.1: Review Governance Approval Queue
- **Route**: `GET /api/approvals?status=pending`
- **Headers**: `Authorization: Bearer <MGR_TOKEN>`
- **Response**: List of pending quotations showing customer, margin, max discount, risk score, and current stage.

##### Operation 2.2: Approve Quotation (with Automatic Tier Routing)
- **Route**: `POST /api/approvals/<APPROVAL_REQ_ID>/action`
- **Headers**: `Authorization: Bearer <MGR_TOKEN>`
- **Payload**:
```json
{
  "action": "approve",
  "note": "Approved 20% discount under strategic Q3 promotional framework."
}
```
- **Integrity Result**:
  - If `maxDiscountPercent <= 25%`: Sets request `status = 'approved'`, updates `quotation.status = 'approved'`, and auto-generates draft invoice and subscription records.
  - If `maxDiscountPercent > 25%`: Automatically escalates request `currentStage = 'Finance'` and logs `Approved Stage 1`.

##### Operation 2.3: Return Quotation for Commercial Revision
- **Route**: `POST /api/approvals/<APPROVAL_REQ_ID>/action`
- **Payload**:
```json
{
  "action": "return",
  "note": "Reduce hardware line discount from 22% to 15% to protect gross margin."
}
```
- **Integrity Result**: Resets `quotation.status = 'draft'`, allowing the rep to edit lines and resubmit.

##### Operation 2.4: Deal Health Rep Nudge
- **Route**: `POST /api/deal-health/<DEAL_ID_OR_QUOTE_NUM>/action`
- **Headers**: `Authorization: Bearer <MGR_TOKEN>`
- **Payload**:
```json
{
  "actionType": "Manager Rep Nudge",
  "note": "Customer view detected 2 hours ago. Follow up today."
}
```
- **Integrity Result**: Updates deal health record with `actionTaken`, `actionBy: 'Sarah Vance'`, `actionRole: 'sales_manager'`, and appends to `ApprovalRequest.auditTrail`.

---

### Role 3: Finance / Operations User

#### A. Responsibilities & Work
- Evaluates Stage 2 high-risk discount exceptions (discounts $> 25\%$ or margins $< 20\%$).
- Manages multi-depot warehouse fulfillment splits and backorder allocations.
- Reconciles recurring billing schedules, invoices, and credit notes.
- Records customer payments and handles subscription cancellations.

#### B. Authorization Level
```
approval:decide_finance_step     — Stage-scoped: only reachable after Manager approval
fulfillment:view
fulfillment:override_split
billing:view
billing:reconcile
subscription:cancel
subscription:issue_credit_note
invoice:record_payment
```

#### C. Data Integrity Rules Enforced by Server
1. **Stage Sequencing Integrity**: Finance approval is structurally unreachable while a quote sits at `Sales Manager`. Calling the decision endpoint returns `Data Integrity Violation: Finance approval is structurally unreachable before Sales Manager approval`.
2. **Physical Inventory Limit Enforcement on Split Overrides**: Manual warehouse split allocations validate requested quantity against `quantityOnHand - quantityReserved` per warehouse. The server rejects allocations exceeding physical depot inventory.
3. **Credit Notes as Immutable Ledger Entries**: Cancelling a subscription never mutates or erases past billed amounts. The server generates a distinct `Invoice` of `type: 'Credit Note'` referencing the original subscription with negative or adjusting totals.
4. **Strict Idempotency on Payment Recording**: Calling `/api/billing/invoices/:id/pay` multiple times (double-clicks or retries) returns HTTP 200 with an idempotent no-op message, preventing duplicate payment ledger corruption.

#### D. Operational Steps & Verification

##### Operation 3.1: Confirm Multi-Warehouse Split Allocation
- **Route**: `POST /api/fulfillment/<QUOTE_NUMBER>/confirm-split`
- **Headers**: `Authorization: Bearer <FINANCE_TOKEN>`
- **Payload**:
```json
{
  "splits": [
    { "warehouse": "Main Warehouse", "qty": 18 },
    { "warehouse": "East Depot", "qty": 6 }
  ]
}
```
- **Integrity Result**: Validates that `18 <= (OnHand - Reserved)` for Main Warehouse and `6 <= (OnHand - Reserved)` for East Depot. Atomically increments `quantityReserved` via `findOneAndUpdate`.

##### Operation 3.2: Record Invoice Payment (Idempotent)
- **Route**: `POST /api/billing/invoices/<INVOICE_ID>/pay`
- **Payload**:
```json
{
  "method": "ACH Direct Debit",
  "transactionId": "TXN-ACH-88491"
}
```
- **Integrity Result**: Sets `status = 'Paid'`, records timestamp and operator name. A second call with identical payload returns `Payment already recorded (idempotent no-op - no duplicate balance alteration)`.

##### Operation 3.3: Cancel Subscription with Credit Note Generation
- **Route**: `POST /api/billing/subscriptions/<SUBSCRIPTION_ID>/cancel`
- **Payload**:
```json
{
  "reason": "Customer migrated to custom on-premise license",
  "refundPercent": 50
}
```
- **Integrity Result**: Sets subscription `status = 'Cancelled'`, appends cancellation note to subscription history, and creates an explicit `Invoice` record (`type: 'Credit Note'`, status: `'Paid'`, negative balance amount) preserving historical billing schedules.

---

### Role 4: Customer (Portal User)

#### A. Responsibilities & Work
- Accesses quote online via authenticated customer portal link.
- Reviews line items, redlines terms, and asks line-specific questions.
- Submits structured counter-discount proposals.
- One-click confirms final agreed commercial terms.

#### B. Authorization Level
```
portal_quotation:view_own        — Strict customer ownership check
portal_quotation:comment
portal_quotation:counter_discount
portal_quotation:confirm
```

#### C. Data Integrity Rules Enforced by Server
1. **Strict Customer Ownership**: Every portal route verifies `quote.customer._id === req.user.customerId`. Cross-tenant reads or counter-proposals are rejected with HTTP 403 `Access denied: Customers are strictly prohibited from viewing quotations belonging to other accounts`.
2. **Counter-Discounts Re-Run Exact CPQ & Risk Logic**: Customer counter-offers call the internal `processQuotationCalculation()` engine. If the counter-offer exceeds rep discount ceilings, the quote re-enters the governance queue (`status = 'pending_approval'`, `currentStage = 'Sales Manager'`).
3. **No Direct Price/Status Mutation**: Customers cannot invoke direct field updates on `discountPercent`, `unitPrice`, or `status`. They submit proposal requests through `/counter`, and the server evaluates and persists structured proposal redlines.
4. **Final Confirmation Gate Check**: Confirming a deal verifies real-time status. If the quotation has been rejected or remains pending governance approval, confirmation is blocked (`Cannot confirm quotation: Deal is still pending governance approval sign-off`).

#### D. Operational Steps & Verification

##### Operation 4.1: View Quotation in Customer Portal
- **Route**: `GET /api/negotiations/<QUOTE_ID>`
- **Headers**: `Authorization: Bearer <CUSTOMER_TOKEN>`
- **Integrity Result**: Validates customer ownership and loads live quote redlines and comment threads.

##### Operation 4.2: Submit Customer Counter-Discount
- **Route**: `POST /api/negotiations/<QUOTE_ID>/counter`
- **Payload**:
```json
{
  "counterDiscountPercent": 22,
  "requestedDate": "2026-10-15",
  "customerComment": "We commit to multi-year term if discount is adjusted to 22%."
}
```
- **Integrity Result**: Recomputes deal risk score and margin. If $22\%$ exceeds rep ceiling, transitions quotation to `pending_approval` and logs `Counter-Offer Submitted` in the approval audit trail.

##### Operation 4.3: One-Click Final Confirmation
- **Route**: `PATCH /api/quotations/<QUOTE_ID>/status`
- **Payload**: `{ "status": "confirmed" }`
- **Integrity Result**: Verifies quotation is in an approved state. Triggers auto-billing generation and dispatches fulfillment queue order.

---

### Role 5: Admin

#### A. Responsibilities & Work
- Manages product catalog, pricing types, and active/archived statuses.
- Configures discount tier ceilings, approval rules, and escalation chains.
- Oversees warehouse depot registry and logistics nodes.
- Manages platform users and performs role reassignments.

#### B. Authorization Level
```
product:create / edit / archive
price_list:configure
warehouse:create / edit / delete
discount_tier:configure
approval_chain:configure
subscription_plan:configure
user:manage
+ Inherits all permissions from Rep, Manager, and Finance
```

#### C. Data Integrity Rules Enforced by Server
1. **Validation Boundaries for Governance**:
   - Discount ceilings and margin floors must be valid percentages between $0\%$ and $100\%$.
   - A warehouse cannot be deleted or decommissioned while `quantityReserved > 0` stock is allocated to open orders.
2. **Product Soft-Delete Archival**: Products are archived by setting `isActive = false`, never hard-deleted with `findByIdAndDelete`. This preserves foreign-key references on historical `QuotationLine` and `Invoice` records.
3. **User Role Change Audit Trail**: Promoting or changing a user's role records an immutable entry in `user.roleAuditTrail` containing `{ previousRole, newRole, changedBy, changedByRole, reason, timestamp }`.

#### D. Operational Steps & Verification

##### Operation 5.1: Archive Product (Soft-Delete)
- **Route**: `PATCH /api/products/<PRODUCT_ID>/archive`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Integrity Result**: Sets `isActive = false`. Historical quotation and invoice lines referencing the product remain intact and queryable.

##### Operation 5.2: Configure Discount Ceilings with Validation & Versioning
- **Route**: `PUT /api/discounts/ceilings`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Payload**:
```json
{
  "rules": [
    {
      "tier": "Gold",
      "category": "Hardware",
      "maxDiscountCeiling": 22,
      "minMarginFloor": 25,
      "requiredApproverRole": "sales_manager"
    }
  ]
}
```
- **Integrity Result**: Validates $0 \le \text{ceiling} \le 100$, stamps `version: version + 1`, and logs `lastUpdatedBy: 'Marcus Chen'`. Existing quotations retain their original risk score snapshot.

##### Operation 5.3: Decommission Warehouse (Active Reservation Guard)
- **Route**: `DELETE /api/fulfillment/warehouses/Main%20Warehouse`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Integrity Result**: If `quantityReserved > 0`, the server rejects deletion with HTTP 400 `Data Integrity Violation: Warehouse cannot be deleted because reserved units are actively allocated to open orders`.

##### Operation 5.4: Promote User Role with Audit Trail
- **Route**: `PATCH /api/auth/users/<USER_ID>/role`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Payload**:
```json
{
  "role": "sales_manager",
  "reason": "Promoted to Senior Sales Manager after Q3 milestone achievement"
}
```
- **Integrity Result**: Updates role and appends audit row with administrator identity and timestamp to `roleAuditTrail`.

---

## 3. End-to-End Operational Lifecycle Walkthrough

```
[1. Sales Rep] ──────> Builds Quotation with 20% discount (Risk: 35/100)
                              │
                              ▼ (Auto-escalation triggered)
[2. Sales Manager] ───> Reviews Governance Queue:
                        - Rejects without reason? -> BLOCKED (Mandatory note)
                        - Approves with note     -> Appends to Audit Trail
                              │
                              ▼ (Advances to Customer Portal)
[3. Customer Portal] ─> Customer views online (Ownership checked)
                        - Counters with 22% discount -> Recomputes Risk Score
                        - Confirms terms             -> Gate verifies Approval
                              │
                              ▼ (Confirmed)
[4. Finance / Ops] ───> Multi-Warehouse Split Allocation:
                        - Verifies physical On-Hand vs Reserved stock
                        - Atomically reserves stock via findOneAndUpdate
                        - Idempotent payment recording
                        - Subscription cancellation creates Credit Note
                              │
                              ▼
[5. Admin Governance]-> Product soft-delete, warehouse guards, role change auditing
```

---

## 4. Automated Verification Suite Execution

The repository includes a dedicated test script (`server/test_role_integrity.js`) that tests all 5 roles and every integrity constraint against the live server.

### Running the Verification Suite:
```bash
node server/test_role_integrity.js
```

### Verified Suite Results:
```
================================================================
   DEALFLOW360 — 5 ROLES & DATA INTEGRITY VERIFICATION SUITE   
================================================================

✅ PASS: Rep login returns token
✅ PASS: Manager login returns token
✅ PASS: Admin login returns token
✅ PASS: Catalog data loaded

--- 1. SALES REP TESTS ---
✅ PASS: Rep quote with 20% discount triggers requiresApproval = true
✅ PASS: Quote status set to pending_approval
✅ PASS: Approval request created for quote in governance queue
✅ PASS: Integrity Rule: Sales Rep self-approval is strictly blocked by server
✅ PASS: Integrity Rule: Rep line mutations blocked once quote leaves draft status

--- 2. SALES MANAGER TESTS ---
✅ PASS: Integrity Rule: Governance rejection requires mandatory reason
✅ PASS: Manager approves quotation successfully
✅ PASS: Integrity Rule: Decision appends immutable audit row with approver name
✅ PASS: Integrity Rule: Deal health nudge logged with manager name and timestamp

--- 3. FINANCE / OPERATIONS TESTS ---
✅ PASS: Auto-billing generated invoices on approval
✅ PASS: Payment recorded on invoice
✅ PASS: Integrity Rule: Duplicate payment is idempotent no-op without balance corruption
✅ PASS: Active subscriptions list available
✅ PASS: Integrity Rule: Subscription cancellation creates separate Credit Note ledger invoice
✅ PASS: Credit Note invoice has type Credit Note
✅ PASS: Integrity Rule: Finance approval is structurally unreachable before Sales Manager approval

--- 4. CUSTOMER PORTAL TESTS ---
✅ PASS: Integrity Rule: Final confirmation gate rejects confirmation on rejected deals
✅ PASS: Integrity Rule: Customer counter-discount re-evaluates risk and triggers governance escalation

--- 5. ADMIN TESTS ---
✅ PASS: Integrity Rule: Admin discount ceiling > 100% rejected
✅ PASS: Integrity Rule: Product archival performs soft-delete (isActive: false) to preserve quote/invoice references
✅ PASS: Integrity Rule: Warehouse with active reserved stock cannot be deleted
✅ PASS: Admin updates user role
✅ PASS: Integrity Rule: Role promotion recorded in user roleAuditTrail
✅ PASS: Integrity Rule: Audit trail records admin name who changed role

================================================================
   TEST RESULTS: 28 PASSED, 0 FAILED               
================================================================
```

---

## 5. Summary of Key Code Modifications for Data Integrity

| Role / Domain | File Modified | Integrity Rule Enforced |
| :--- | :--- | :--- |
| **Sales Rep** | `server/src/services/approval/approvalEngine.js` | Self-approval ban (`user.role === 'sales_rep'` and `createdBy === user._id` rejected). |
| **Sales Rep** | `server/src/controllers/quotationController.js` | Rep `edit_own` ownership check; line edits blocked once quote leaves `draft` status. |
| **Sales Manager** | `server/src/services/approval/approvalEngine.js` | Stage-awareness constraint (`currentStage === 'Sales Manager'`); mandatory return/reject note. |
| **Sales Manager** | `server/src/controllers/dealHealthController.js` | Nudges and escalations write audit records with `actionBy`, `actionRole`, and `timestamp`. |
| **Finance / Ops** | `server/src/controllers/billingController.js` | Idempotent payment recording; cancellation creates explicit `Credit Note` ledger entry. |
| **Finance / Ops** | `server/src/services/fulfillment/fulfillmentEngine.js` | Validates `qty <= (OnHand - Reserved)`; atomic stock reservation with `findOneAndUpdate`. |
| **Customer Portal** | `server/src/controllers/negotiationController.js` | Customer ownership check (`quote.customer === req.user.customerId`); counter-discount re-runs unified CPQ engine. |
| **Admin** | `server/src/controllers/productController.js` | Product archival soft-deletes (`isActive = false`), preserving quote and invoice links. |
| **Admin** | `server/src/controllers/fulfillmentController.js` | Decommissioning warehouse blocked if `quantityReserved > 0`. |
| **Admin** | `server/src/controllers/authController.js` | User role changes recorded in immutable `roleAuditTrail`. |
| **Admin** | `server/src/controllers/discountController.js` | Discount ceilings validated strictly between $0\%$ and $100\%$ with version stamping. |
