# AGENTS.md — LookaGenius Academy

## Project Overview
Static multi-page educational platform with a built-in CMS (Decap CMS), dual auth (Supabase + localStorage), RTL Arabic-first UI, and AI assistant. No build tools or bundlers — vanilla HTML/CSS/JS.

## Quick Start
- **Dev server**: `serve_admin.bat` (auto-detects Python http.server or npx http-server)
- **No npm/yarn install needed** — this is a vanilla JS project
- **No linter/formatter configured**

## Tech Stack
- **Frontend**: HTML5, CSS3 (Glassmorphism, dark theme, custom properties), Vanilla JS (ES6+)
- **3D/Effects**: Three.js (particle network), AOS (scroll animations), Particles.js
- **Icons/Fonts**: Font Awesome 6.4.0, Google Fonts (Cairo, Tajawal)
- **Charts**: Chart.js
- **Auth**: Supabase Auth + localStorage fallback
- **DB**: localStorage (primary) + Supabase/PostgreSQL (cloud sync)
- **CMS**: Decap CMS (admin/index.html + admin/config.yml)
- **AI**: Transformers.js + Pollinations AI + Gemini API
- **i18n**: Custom, full EN/AR with RTL/LTR switching
- **PWA**: manifest.json
- **Sync**: BroadcastChannel API (cross-tab) + Supabase (cross-device)

## Project Structure
```
/                             # Root: HTML pages, generators, configs
├── js/                       # Core JS: app.js, auth.js, db.js, db-sync.js, components.js, mock-api.js, supabase.js, ai-assistant.js
│   └── pages/                # Page-specific JS (one per page type)
├── css/                      # style.css, animations.css
├── assets/
│   ├── css/anti-gravity.css  # Premium UI design system
│   ├── js/                   # i18n.js, chatbot.js, auth.js (legacy)
│   └── img/                  # Static images
├── admin/                    # Decap CMS: index.html, config.yml
├── _courses/                 # CMS course content (Markdown)
├── generate.js               # Node.js HTML page generator
└── generate.py               # Python HTML page generator (alternative)
```

## Coding Conventions
- **Language**: ES6+ JavaScript, no TypeScript, no frameworks
- **No semicolons** (from `script.js` style — verify per file)
- **Variables**: `let`/`const` (ES6+), camelCase naming
- **Functions**: Arrow functions preferred (`const fn = () => {}`)
- **DOM queries**: `document.querySelector`, `document.getElementById`
- **Strings**: Template literals with backticks for HTML construction
- **CSS**: Custom properties (`--primary: #00D4FF`), Glassmorphism (`backdrop-filter: blur()`), dark theme
- **HTML**: RTL (`dir="rtl"`, `lang="ar"`), Arabic-first with English i18n support
- **No modular JS** — scripts are loaded via `<script>` tags in HTML
- **i18n**: `i18n.js` exports `i18n` object with `t()` for translations; `data-i18n` attributes on elements

## Key Architectural Patterns
- **Multi-Page Application**: Each `.html` file is a full page; `<script src="js/pages/page-name.js">` for page-specific logic
- **Database**: `js/db.js` — `DB` object with CRUD methods for all entities (users, courses, scholarships, articles, services, team, financials, notifications, etc.)
- **Auth**: `js/auth.js` — dual auth: Supabase first, localStorage fallback; stores tokens in `localStorage`
- **Sync**: `js/db-sync.js` — BroadcastChannel for cross-tab sync; `js/supabase.js` — cloud push/pull
- **Mock API**: `js/mock-api.js` — REST-like interface over localStorage (swap-ready for real backend)
- **Components**: `js/components.js` — dynamic navbar/sidebar rendering
- **AI Assistant**: `js/ai-assistant.js` — multi-engine (Transformers.js, Pollinations, Gemini)

## User Roles (6 dedicated dashboards)
- Student, Parent, Teacher, Engineer, Accountant, Admin
- Each has `dashboard-{role}.html` + `js/pages/dashboard-{role}.js`

## Data Collections (in `js/db.js`)
Users, Courses, Scholarships, Articles, Services, Team, CourseCategories, Currencies, Settings, Notifications, Financials, SettlementRequests, Collaborations

## Important Notes
- All HTML pages except `index.html` are **auto-generated** by `generate.js` or `generate.py`
- To add a new page: update `generate.js`, regenerate, then add page-specific JS in `js/pages/`
- `assets/css/anti-gravity.css` is the primary design system (over 2000 lines) — must be loaded on EVERY page
- No package.json — all dependencies loaded via CDN in HTML `<head>`
- Arabic is the primary language; English is secondary via i18n

## Deployment & DevOps
- **Hosting**: Vercel (`https://lookagenius.vercel.app`)
- **GitHub**: `https://github.com/lookageniuspro/lookagenius`
- **Supabase project**: `hdpmybarejjbnryjxvkk` (linked via `supabase link`)
- **Supabase CLI**: installed globally via npm (`npx supabase`)
- **Database**: PostgreSQL via Supabase, applied via `supabase db push --include-all`
- **Migration file**: `supabase/migrations/20260718211106_fix_forward_refs.sql`
- **vercel.json**: version 2, cleanUrls, security + cache headers, /admin rewrite

## NextGen Modules (9 total)
Load ALL on every dashboard page in this exact order:
1. `js/nextgen-core.js` — core engine
2. `js/nextgen-paymob.js` — payment integration
3. `js/nextgen-communication.js` — real-time chat/notifications
4. `js/nextgen-assignments.js` — assignments & submissions
5. `js/nextgen-gamification.js` — badges, points, leaderboards
6. `js/nextgen-live.js` — live streaming
7. `js/nextgen-analytics.js` — analytics & reporting
8. `js/nextgen-paths.js` — learning paths
9. `js/nextgen-loader.js` — AI assistant loader (loads after dashboard-common)

## Dashboard Script Template
```html
<!-- Core -->
<script src="js/db.js" defer></script>
<script src="js/components.js" defer></script>
<script src="js/supabase.js" defer></script>
<script src="js/auth.js" defer></script>
<script src="js/app.js" defer></script>
<!-- Libs (for all roles) -->
<script src="lib/admin-lib.js" defer></script>
<script src="lib/teacher-lib.js" defer></script>
<script src="lib/student-lib.js" defer></script>
<!-- NextGen (all 9) -->
<script src="js/nextgen-core.js" defer></script>
<script src="js/nextgen-paymob.js" defer></script>
<script src="js/nextgen-communication.js" defer></script>
<script src="js/nextgen-assignments.js" defer></script>
<script src="js/nextgen-gamification.js" defer></script>
<script src="js/nextgen-live.js" defer></script>
<script src="js/nextgen-analytics.js" defer></script>
<script src="js/nextgen-paths.js" defer></script>
<script src="js/pages/dashboard-common.js" defer></script>
<script src="js/nextgen-loader.js" defer></script>
<script src="js/pages/dashboard-{role}.js" defer></script>
```

## Public Page Template
Every public page MUST include in `<head>`:
- `css/style.css`
- `css/animations.css` (if applicable)
- `assets/css/anti-gravity.css` (the premium design system)

Every public page MUST include before `</body>`:
- `<script src="js/supabase.js" defer></script>` (after CDN scripts, before db.js)
- `<script src="js/db.js" defer></script>`
- `<script src="js/auth.js" defer></script>`
- `<script src="js/app.js" defer></script>`
