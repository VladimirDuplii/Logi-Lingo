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

- [LAYOUT-020] Доробити адаптивність макету (responsive layout polish)
  - Why: Забезпечити коректну адаптивність DuoLayout: центрування course tree, відступи, та межі сайдбару.
  - Acceptance:
    - Горизонтальні відступи для `#main-content` відповідають прикладу на sm/md/lg/xl.
    - Course tree центрований; обмеження ширини кероване через props (на курсах: `xl:max-w-2xl`).
    - `#sidebar-right`: min 320px, max 400px на ≥ xl; на < xl ховається/стакається згідно дизайну.
  - Files: `resources/js/Layouts/DuoLayout.jsx`, `resources/js/Pages/Courses/Show.jsx`
  - Priority: P2, Type: ux

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

- [QUEST-100] Інтерактивний пошук скарбу з самоцвітами (Treasure Hunt)
  - Why: Підвищити мотивацію проходження уроків через мета-гру і відчуття прогресу.
  - Concept:
    - Під час розв’язування уроків видаються фрагменти карти-пазлу. Зібравши всі фрагменти — карта показує X (місце копати).
    - Можна копати й до повної карти: кожна спроба коштує 50 XP (з підтвердженням списання).
    - Клік/тап по зображенню карти надсилає координати; якщо в межах радіусу X — успіх і нагорода.
  - Balance/Economy:
    - 1 безкоштовна спроба на день; далі — 50 XP/спроба; денний ліміт платних спроб.
    - Pity-механіка: гарантована підказка/успіх після N невдалих спроб.
    - Дублікати фрагментів конвертуються у “кристали” для підказок.
    - М’який радіус влучання, щоб уникати фрустрації.
  - Rewards (rarity):
    - Звичайні: 15-хв XP boost, +1 серце, монети/кристали.
    - Рідкісні: косметика (бейджі, рамки профілю, іконки курсу).
    - Епічні: сезонний трофей/бейдж.
    - Без pay-to-win: робимо акцент на косметиці та дрібних QoL-бонусах.
  - Integration:
    - Синергія з Daily Quests: виконаний XP-гол підвищує шанс підказки.
    - Стрики: за серії днів — гарантований фрагмент у певні дні.
  - UX/Anti-abuse:
    - Підтвердження списання XP; чіткі причини невдачі; кулдаун між спробами.
    - Серверна валідація координат, rate-limit, лог подій для аналітики.
    - Мобільний френдлі: великі зони торкання, плавні анімації.
  - Analytics & A/B:
    - Метрики: конверсія в першу спробу, середні витрати XP, % зібраних карт, 7/14-day retention.
    - A/B: ціна спроби, наявність безкоштовної спроби, сила підказок.
  - Contract (MVP):
    - Entities: TreasureMap(id, season, pieces=9, targetX,targetY,radius), UserMapProgress(user_id,map_id,owned_pieces[], attempts_today, free_attempts_left, crystals), DigAttempt(id,user_id,map_id,x,y,success,cost_xp).
    - API:
      - GET /api/v1/treasure/map/current -> {map, userProgress}
      - POST /api/v1/treasure/dig {x,y} -> {success, reward?, points, hearts}
      - GET /api/v1/treasure/rewards -> catalog
    - UI:
      - Правий сайдбар: віджет прогресу карти (X/Y, кнопка “Копати”).
      - Сторінка карти: зображення з інтерактивним кліком, лічильники спроб/XP, історія останніх спроб.
    - Acceptance:
      - 1 карта на сезон, 9 фрагментів, 1 безкоштовна спроба/день, далі 50 XP.
      - Pity після 5 невдалих спроб: гарантія підказки або збільшення радіусу на одну спробу.
      - Успішна спроба — видача винагороди та лог події; баланс XP/сердець оновлюється в UI.
  - Priority: P1, Type: feat, Labels: gamification,seasonal

// moved to Done

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
 - [DASH-003] Quick actions (Continue, Refill hearts)
   - Implemented global toast system, wired refill with disabled states and success/error toasts; Continue navigates to next lesson.
 - [LEARN-013] Грід відповідей = кількості варіантів (2/3/4 в ряд)
   - MultipleChoice тепер динамічно будує грід: 2/3/4 варіанти в ряд (wrap на малих екранах). File: `DuoLesson.jsx`.
 - [DASH-002] Course progress aggregation
   - Dashboard shows completed/total lessons and percent for the active course; zero-safe when no active course.
   - Помітка: перевірити потім.
