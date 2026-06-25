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
- `anti-gravity.css` is the primary design system (over 2000 lines)
- No package.json — all dependencies loaded via CDN in HTML `<head>`
- Arabic is the primary language; English is secondary via i18n
