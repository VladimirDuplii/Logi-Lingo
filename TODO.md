# TODO

A single, living list to coordinate work. Update via PRs/commits; reference IDs in commits/PR titles (refs DASH-###).

## Now

- [DASH-001] User Dashboard MVP UI
  - Why: Provide a single place for user status and quick actions.
  - Acceptance:
    - Header shows avatar, name, points, hearts.
    - “Continue lesson” visible when there’s an active course and pending lesson.
    - Responsive layout; no console errors.
  - Files/Endpoints: React page + components; GET /api/v1/progress; GET /api/v1/progress/courses/{courseId}
  - Priority: P0, Type: feat, Branch: feat/user-dashboard

- [DASH-002] Course progress aggregation
  - Why: Show % completion and totals on the dashboard.
  - Acceptance:
    - Show completed/total lessons and percent for active course.
    - Zero-safe when no active course.
  - Files/Endpoints: ProgressController@getCourseProgress (already exists) — reuse/adjust mapping
  - Priority: P0, Type: feat

- [DASH-003] Quick actions (Continue, Refill hearts)
  - Why: Reduce friction to resume learning and manage hearts.
  - Acceptance:
    - “Continue lesson” navigates to the next available lesson.
    - “Refill hearts” calls POST /api/v1/progress/hearts/refill and updates UI.
    - Proper disabled states and error/toast handling (insufficient points, hearts full).
  - Files/Endpoints: POST /api/v1/progress/hearts/refill; client wiring
  - Priority: P1, Type: feat

## Backlog

- [DASH-010] Leaderboard (Top-5 by points)
  - Why: Motivation via competition.
  - Acceptance: List top-5 users by points with avatar/name/points.
  - Implementation: Simple query (later caching/pagination).
  - Priority: P2, Type: feat

- [DASH-011] Recent activity feed
  - Why: Visibility of user progress over time.
  - Acceptance: Show last N events (lesson completed, XP earned, hearts refilled).
  - Priority: P2, Type: feat

- [DASH-012] Badges and milestones
  - Why: Gamification.
  - Acceptance: Display earned badges; placeholder for locked ones.
  - Priority: P3, Type: feat

## In Progress

- (empty)

## Blocked

- (empty)

## Done

- [AUTH-100] Sanctum/auth hardening; media/admin fixes; Duolingo-like lesson flow (merged to main)
