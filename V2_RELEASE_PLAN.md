## V2 Release Baseline

Updated: 2026-03-13

This file is the shipping reference for the V2 management game. It defines the current release scope, the acceptance gates for every remaining milestone, and the order in which the remaining systems should be built and hardened.

### Shipping Path

The commercial release target is the V2 flow only. Legacy routes remain in the repository, but they are not the release path unless a milestone explicitly pulls logic forward into V2.

Frontend V2 routes currently exposed in `/Users/alexdevries/Cursor AI 2/frontend/src/App.tsx`:

- `/new-career`
- `/hq`
- `/week-planner`
- `/inbox`
- `/match-center/:matchId`
- `/post-match/:matchId`
- `/standings`
- `/career-squad`
- `/career-finances`
- `/save-load`

### Current Baseline

The V2 loop is already functional enough to continue milestone delivery:

- Career creation works.
- HQ, Planner, Inbox, Standings, Squad, Finances, and Save/Load all exist in V2.
- Guided match flow exists across Match Center and Post Match.
- Contract expiry and negotiation depth are already beyond prototype quality.
- Player profile, role assignment, promise tracking, development plans, recent history, and profile status directives exist in Squad.

Known structural and product risks at baseline:

- `/Users/alexdevries/Cursor AI 2/backend/src/v2/services/v2GameService.ts` is too large and needs decomposition before late-stage milestones.
- `/Users/alexdevries/Cursor AI 2/frontend/src/v2/pages/SquadPage.tsx` and `/Users/alexdevries/Cursor AI 2/frontend/src/v2/pages/MatchCenterPage.tsx` are too large and state-heavy.
- `/Users/alexdevries/Cursor AI 2/frontend/src/App.tsx` still mixes legacy and V2 routes, so the release path must remain explicit.
- V2 frontend automated coverage is still shallow compared with backend V2 regression coverage.
- The frontend production build currently warns about bundle size, so performance and code-splitting remain release work.

### Release Gates

Every milestone after `M0` must keep these gates green:

- Backend TypeScript build passes: `npm --prefix backend run build:full`
- Frontend production build passes: `npm --prefix frontend run build`
- Backend V2 regression suite passes: `npm --prefix backend test -- --runInBand test/v2-loop.test.ts`
- Weekly benchmark remains within budget: `npm --prefix backend run benchmark:v2:week`
- Browser smoke stays green for both supported scenarios:
  - `npm --prefix backend run test:v2:e2e:browser`
  - `npm --prefix backend run test:v2:e2e:browser:lower-tier-rollover`
- No new release-blocking console or page errors are introduced in the V2 browser smoke flow.

### Smoke Matrix

The following checks define the minimum V2 smoke surface. If a milestone touches one of these areas, that path must be manually or automatically revalidated.

#### Route smoke

- `/new-career`: league selection, club selection, create career
- `/hq`: active career resolution, summary values, advance/continue controls
- `/week-planner`: save plan, resume state, transition back to HQ
- `/inbox`: render pending events, resolve options, refresh pending count
- `/match-center/:matchId`: open match prep, start guided match, intervention choices
- `/post-match/:matchId`: match result summary, continue to next phase
- `/standings`: league table renders without missing state
- `/career-squad`: player list renders, profile opens, actions save correctly
- `/career-finances`: finance snapshot and transfer-related surfaces render
- `/save-load`: resume existing career, delete save, empty-state handling

#### Cross-route loop smoke

- Create a new career and land in HQ
- Submit a week plan and advance into Inbox or Match Center
- Resolve Inbox events and continue the week
- Start a guided match, make at least one intervention, and reach Post Match
- Advance past week wrap and confirm next-week state
- Save the career, reopen it from Save/Load, and continue
- Force a season rollover scenario and confirm the next season starts cleanly

#### Deep-system smoke

- Contract warning flow: warning -> renewal/promise/release -> counter/fallout branches
- Squad profile flow: role change, promise visibility, development plan save, status directive save
- Match prep flow: lineup selection, auto-pick, pre-start validation, guided match kickoff

### Milestone Roadmap

- `[x] M0 Baseline and Shipping Scope`
  - Lock the V2 release path
  - Define release gates and smoke surface
  - Add repo-owned baseline check entrypoints
  - Record current risks and milestone order

- `[x] M1 Backend Refactor`
  - Split `v2GameService` into domain modules
  - Separate contracts, squad, match, season, finance, and inbox logic
  - Preserve current behavior with regression coverage

- `[x] M2 Frontend Refactor and V2 Test Harness`
  - Break large pages into components and hooks
  - Add focused V2 UI tests for page-critical flows
  - Reduce coupling between route shells and domain state

- `[x] M3 Match Prep and Tactics Foundation`
  - Enforce availability directives in match prep
  - Add formations, lineup rules, and tactical presets
  - Harden auto-selection and lineup validation

- `[x] M4 Matchday Management Depth`
  - Add substitutions, halftime management, and richer intervention choices
  - Expand event variety and tactical consequences during guided matches

- `[x] M5 Post-Match Analytics`
  - Add ratings breakdowns, chance-quality summaries, and tactical feedback
  - Improve actionable feedback into the next planning cycle

- `[x] M6 Squad Management Completion`
  - Add registration and eligibility rules
  - Tie promises to actual match usage
  - Add retraining and positional management depth

- `[x] M7 Training, Medical, and Performance`
  - Add richer weekly training control
  - Add injuries, rehab, and recovery planning
  - Integrate availability risk into squad and match prep

- `[x] M8 Transfers and Scouting`
  - Build a proper V2 scouting and transfer workflow
  - Add reports, shortlists, bids, counteroffers, loans, and agent friction

- `[x] M9 Finance, Staff, and Facilities`
  - Expand finances beyond snapshot status
  - Add staff quality and facility investment systems
  - Connect business decisions back into sporting consequences

- `[x] M10 Board, Fans, Media, and News`
  - Add board meetings, fan sentiment, press choices, and a dynamic news layer
  - Make off-pitch management part of the weekly loop

- `[x] M11 Competitions and Rules Completion`
  - Harden multi-season league logic and edge cases
  - Add missing rules around suspensions, windows, and competition flow

- `[x] M12 UX, Accessibility, and Performance`
  - Add onboarding, settings, keyboard support, reduced-motion support, and readability controls
  - Address bundle size and code-splitting
  - Complete the premium interaction layer

- `[x] M13 QA Hardening and Release Candidate`
  - Expand browser smoke matrix and negative-path coverage
  - Validate save/load resilience and release-blocking bug list
  - Close remaining technical debt that can still affect stability

- `[x] M14 Final Smoke Test and Commercial Polish`
  - Run full end-to-end smoke across tiers and long-loop scenarios
  - Complete balancing, copy polish, visual cleanup, and final defect sweep
  - Ship only when there are no known release-blocking defects
  - Final verification completed on `2026-03-27`: release-candidate, benchmark, default browser smoke, and lower-tier rollover smoke all passed with zero browser console/page errors

### Definition of Done for the Project

The game is only considered release-ready when all milestones above are marked complete, the release gates are green, and the final smoke/polish pass confirms the V2 path is stable, complete, and free of known blocker defects.
