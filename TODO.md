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

// Proposed enhancements

- [LEARN-012] Active/complete tile animations (like reference)
  - Why: Clearer state and delight.
  - Acceptance: ACTIVE tiles pulse subtly; COMPLETE tiles show a check overlay; LOCKED remain gray. No layout shift.
  - Files: `resources/js/Components/Courses/DuoTile.jsx`, `DuoLearn.jsx` (classNames/animations)
  - Priority: P2, Type: polish

- [DASH-020] Inline hearts refill on dashboard header (+ sync with lessons)
  - Why: Faster recovery flow when out of hearts.
  - Acceptance: “Відновити життя (-50 ⚡)” on Dashboard updates hearts/points instantly and is reflected in lesson overlay if open.
  - Files/Endpoints: `Dashboard.jsx` + `ProgressService.refillHearts()` (already exists)
  - Priority: P1, Type: feat

- [UX-015] Toast notifications for refill/results/errors
  - Why: Consistent feedback.
  - Acceptance: Standard success/error toasts for refill, progress updates, and failures (401/400).
  - Files: shared toast utility or lightweight component; used in Dashboard/DuoLesson
  - Priority: P2, Type: ux

- [MEDIA-010] Image lazy-loading and fallback placeholders
  - Why: Performance and resilience if a file is missing.
  - Acceptance: All lesson/option images use loading="lazy" and onError fallback (placeholder icon).
  - Files: `DuoLesson.jsx` (MC + WriteIn), `CourseCard.jsx`
  - Priority: P3, Type: polish

- [PROGRESS-030] Auto-refresh Learn tree after lesson completion
  - Why: Immediate unlock without manual reload.
  - Acceptance: After lesson completion, navigate back to course with a param (e.g., ?refresh=1) or trigger a tree refetch so the next tile becomes ACTIVE instantly.
  - Files: `DuoLesson.jsx` (onExit), `DuoLearn.jsx` (refetch hook)
  - Priority: P2, Type: ux

## In Progress

- (empty)

## Blocked

- (empty)

## Done

- [AUTH-100] Sanctum/auth hardening; media/admin fixes; Duolingo-like lesson flow (merged to main)
