# Project Roadmap: Modern PHP 8.x + MySQL Application

## Phases

- [ ] **Phase 1: Architecture & Foundation** - PSR-4 structure, Database Layer (PDO/Repository), and Vite Setup.
- [ ] **Phase 2: Authentication & Integrations** - Google OAuth2 and Telegram Nutgram Webhook setup.
- [ ] **Phase 3: Core Feature Implementation** - Nutgram Conversations and Google Calendar Sync logic.
- [ ] **Phase 4: Reporting & UI Polish** - Browsershot (PDF), OpenSpout (CSV/Excel), and professional UI/UX.
- [ ] **Phase 5: Deployment Readiness** - Production build and environment configuration.

---

## Phase Details

### Phase 1: Architecture & Foundation
**Goal**: Establishing the project structure and data access layer.
**Depends on**: Nothing
**Requirements**: ARCH-01, ARCH-02, ARCH-03, DB-01, DB-02, DB-03
**Success Criteria** (what must be TRUE):
  1. Application successfully autoloads classes via PSR-4 (Composer).
  2. Database connection is established using PDO and tested via Repository pattern.
  3. Vite successfully bundles and serves CSS/JS assets.
**Plans**: 3 plans
- [ ] 01-01-PLAN.md — Project Scaffolding & PSR-4 Setup
- [ ] 01-02-PLAN.md — Database Layer & Repository Pattern
- [ ] 01-03-PLAN.md — Frontend Asset Pipeline (Vite/Tailwind)

### Phase 2: Authentication & Integrations
**Goal**: Enable secure external communication with Google and Telegram.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. User can authorize with Google OAuth2 and obtain a valid access/refresh token.
  2. Telegram bot responds to commands via Webhooks using the Nutgram SDK.
  3. Secret keys and credentials are securely managed via environment variables.
**Plans**: TBD

### Phase 3: Core Feature Implementation
**Goal**: Deliver the primary business logic (Bot interactions and Calendar sync).
**Depends on**: Phase 2
**Requirements**: BOT-01, BOT-02, CAL-01, CAL-02
**Success Criteria** (what must be TRUE):
  1. User can initiate and complete a multi-step Nutgram conversation.
  2. Application events are correctly synchronized to the user's Google Calendar.
  3. Bot can retrieve and display upcoming Google Calendar events.
**Plans**: TBD

### Phase 4: Reporting & UI Polish
**Goal**: Enhance the user experience and provide professional exports.
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, UI-04, RPT-01, RPT-02
**Success Criteria** (what must be TRUE):
  1. User can download a high-quality PDF report generated from HTML via Browsershot.
  2. Large datasets are exported efficiently to CSV/Excel without memory exhaustion (OpenSpout).
  3. UI interactions (deleting, saving) trigger professional SweetAlert2 confirmations and Animate.css effects.
**Plans**: TBD

### Phase 5: Deployment Readiness
**Goal**: Prepare the application for production use.
**Depends on**: Phase 4
**Requirements**: DEP-01
**Success Criteria** (what must be TRUE):
  1. All frontend assets are optimized and built for production via Vite.
  2. Database migrations and seeds are fully executed and verified.
  3. Production environment configurations (.env) are separated and verified.
**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Architecture & Foundation | 0/3 | Not started | - |
| 2. Authentication & Integrations | 0/3 | Not started | - |
| 3. Core Feature Implementation | 0/3 | Not started | - |
| 4. Reporting & UI Polish | 0/3 | Not started | - |
| 5. Deployment Readiness | 0/3 | Not started | - |
