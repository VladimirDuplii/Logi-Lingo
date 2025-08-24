# TODO (Design & Performance Roadmap)

## Phase 1 (Do now)
- [ ] Aggregate endpoint `/api/dashboard` (userProgress, activeCourseUnits, recentCourses, coursesProgress)
- [ ] Add sessionStorage cache layer for courses & progress (TTL 10m) with revalidation
- [ ] Add AbortController to dashboard data fetch logic
- [ ] Move progress aggregation (lesson counts & percent) to backend SQL and return ready numbers
- [ ] Expose ETag / Last-Modified headers for `/courses` & `/progress` endpoints
- [ ] Telemetry: send `dashboard-total` perf measure to backend `/metrics/perf`

## Phase 2 (After design stabilizes)
- [ ] Code splitting (React.lazy) for heavy sections (Progress list, Recent courses)
- [ ] IntersectionObserver lazy mount of non-visible sections
- [ ] Delayed skeleton (120ms rule) to avoid flash on very fast loads
- [ ] WebSocket / Echo live progress updates (optional)
- [ ] Prefetch `/courses` on idle or hover of main CTA

## Phase 3 (Enhancements)
- [ ] Progressive SSR / streaming (if Inertia SSR enabled)
- [ ] Offline-first caching strategy (Cache Storage + stale-while-revalidate)
- [ ] Metrics dashboard (P50/P95 for dashboard load)
- [ ] Dark mode token audit + prefers-color-scheme support

---
Created: 2025-08-24# План розробки Logi-Lingo

## Задачі, які потрібно виконати

### 1. Розробка користувацького інтерфейсу

-   [ ] Завершити всі заплановані React-компоненти
-   [ ] Реалізувати інтерактивні вправи різних типів
-   [ ] Розробити адаптивний дизайн для мобільних пристроїв
-   [ ] Впровадити анімації та перехідні ефекти

### 2. Функціональність користувача

-   [ ] Реалізувати систему відстеження прогресу користувача
-   [ ] Впровадити механізм нарахування балів та сердець
-   [ ] Розробити повноцінний профіль користувача та налаштування
-   [ ] Створити систему досягнень і бейджів

### 3. Системи підписки

-   [ ] Інтегрувати Stripe для обробки платежів
-   [ ] Розробити функціонал для преміум-підписок
-   [ ] Створити сторінку з порівнянням планів підписки
-   [ ] Імплементувати пробний період для преміум-функцій

### 4. Наповнення контентом

-   [ ] Створити повноцінні курси з уроками та вправами
-   [ ] Додати медіафайли (аудіо, зображення) для вправ
-   [ ] Розробити курси різного рівня складності
-   [ ] Включити практичні завдання з реальними ситуаціями

### 5. Тестування

-   [ ] Написати модульні тести для основних компонентів
-   [ ] Провести інтеграційні тести для перевірки взаємодії між компонентами
-   [ ] Виконати тестування користувацького інтерфейсу
-   [ ] Організувати бета-тестування з реальними користувачами

### 6. Розгортання

-   [ ] Налаштувати CI/CD процес
-   [ ] Підготувати проект до виробничого середовища
-   [ ] Оптимізувати продуктивність додатку
-   [ ] Налаштувати моніторинг і журналювання

### 7. Локалізація

-   [ ] Додати підтримку кількох мов інтерфейсу
-   [ ] Адаптувати контент під різні культурні особливості

## Прогрес

-   [x] Створена повна структура бази даних
-   [x] Реалізована адміністративна панель з Filament
-   [x] Розроблені базові компоненти для взаємодії користувача
-   [x] Створено документацію та ERD
-   [x] Реалізовані сідери для початкового наповнення бази даних

_Оновлено: 2025-08-17_

<!-- webhook test marker 2025-08-24 -->
