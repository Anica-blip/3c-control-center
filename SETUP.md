# SETUP — 3c-control-center

> Repo path: `SETUP.md`. Names only; never a secret value in this file. Kept to the 3C Cooking Lab Standard, section G.

## 1. What it is

`3c-control-center` is Chef's private dashboard for the 3C Thread To Success™ community (repo name `3c-control-center`). A React and TypeScript app, built with Vite, that talks to the Supabase project **3C Control Center**. Content, scheduling, characters, chat, Voice Studio, marketing pages and settings live here. Chef is the only user.

## 2. Addresses

| What | Address |
|---|---|
| Live dashboard (and admin) | `https://3c-control-center.vercel.app` |
| Jan (called by the dashboard) | `https://jan-assistant.3c-innertherapy.workers.dev/` |
| Aurion posting Worker | `aurion-bot` on Cloudflare (repo `aurion-3cmascot`); not called by the dashboard, it reads the schedule from the database |

## 3. External services

| Service | What for |
|---|---|
| **Supabase**, project **3C Control Center** (`uqyqpwhkzlhqxcqajhkn`) | Database, sign-in (Auth), Storage bucket `media`, edge functions (for example `ai-chat`, `check-email-counts`, the brand colour, font, logo and guideline functions). |
| **Vercel**, project `3c-control-center` | Hosts the dashboard. Builds with `vite build`. |
| **GitHub** (`Anica-blip/3c-control-center`) | The code. Sign-in provider for the dashboard (through Supabase). GitHub Actions workflows, see below. |
| **Cloudflare** | Worker `jan-assistant` (Jan; its own repo and register row B-5). A screenshot Worker built from `screenshot-worker.js` and `wrangler.toml` (R2 bucket `3c-control-center`). |
| **Telegram** | Not called from this repo. Posts are sent by the `aurion-bot` Worker. |

Removed on 22 Nov 2026 and no longer used: Render (cron job and bot), the Vercel cron gateway (`cron-gateway-auth`), Railway, the old posting runners in this repo (`render-cron.ts`, `railway-server.ts`, and the `process-scheduled-posts` workflow), the unused `api/auth.ts` function, and the committed `.env`.

**GitHub Actions in `.github/workflows/`:**

| Workflow | What it does | Secrets it reads (names only) |
|---|---|---|
| `simple-deploy.yml` | Builds on every push to `main` and publishes to GitHub Pages | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `check-email-counts.yml` | Runs 3 times a day (00:00, 08:00, 16:00 UTC) to check mailbox counts | `SUPABASE_SERVICE_KEY` and per-mailbox password secrets |
| `cloudflare-screenshot-worker.yml` | Deploys the screenshot Worker when `screenshot-worker.js` or `wrangler.toml` changes | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` |
| `screenshot processor.yml` | Takes external-page screenshots into R2 (started by hand or by the screenshot Worker) | `R2_ACCESS_KEY_ID`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_SECRET_ACCESS_KEY`, `SUPABASE_SERVICE_KEY`, `SUPABASE_URL` |

## 4. Supabase (project 3C Control Center)

Tables the dashboard touches: `content_posts`, `scheduled_posts`, `dashboard_posts`, `dashboard_platform_assignments`, `post_platforms`, `character_profiles`, `social_platforms`, `telegram_configurations`, `dashboard_templates`, `external_services`, `media_content`, `pending_content_library`, `daily_schedule_prompts`, `brand_colors`, `brand_font`, `brand_guidelines`, `brand_logos`, `public_chat_sessions`, `public_chat_messages`.

- Row Level Security is **on** for all of them.
- `public_chat_sessions` and `public_chat_messages`: visitors may add and read chat (they do not sign in); nothing else is public.
- `scheduled_posts` and `dashboard_posts`: no policy that allows everyone.
- **Not yet at the Standard:** the access rules of several of the other tables were written early and are wider than the Standard allows (section B: writes through `is_owner()` only). They are being reviewed and tightened one table at a time, each as a named migration with a rollback. Until then the dashboard's own sign-in guard (below) is what protects the pages.
- The code also refers to `avatars`, `diagnostic_logs`, `pending_schedule`, `social_platforms_content` and `telegram_channels`, which do not exist as tables in the project today. (`media` is the Storage bucket.)
- Functions used by the app: `is_owner()` (owner check at sign-in), `increment_template_usage`. Edge function `ai-chat` is called by the AI chat page.
- Table lists of the bot (`faq`, `fact`, `keyword`, `greeted_users`, `about_3c`) live in the same project and are documented in the `aurion-3cmascot` repo.
- Database clean-up of 21 Nov 2026 (old cron functions, pg_cron and pg_net, two unused tables) is recorded as migrations in the `aurion-3cmascot` repo (`supabase/migrations/`), because it was done for the bot's schedule.

## 5. Workers

- **`jan-assistant`** — documented in the Workers and Logins register (row B-5): every action owner-only, asks this Supabase project, deploy by Dashboard paste. The dashboard calls it from `src/aichatcomponent.tsx`.
- **Screenshot Worker** (`screenshot-worker.js`, Worker name `3c-control-center`, R2 binding `SCREENSHOTS`, bucket `3c-control-center`) — routes: `/health` (public check) and `POST /api/screenshot`. Deployed by the GitHub workflow above. Secrets by name: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. **Not brought to the Standard (section A)**; the register records it as never having worked. Chef decides whether to remove or rebuild it.
- Observability (stored logs) is **off and stays off** for every Worker.

## 6. Login

- **Supabase project:** 3C Control Center. GitHub provider on (an OAuth app registered in GitHub for the dashboard; its callback is the project's Supabase auth address).
- **Session name (`storageKey`):** `sb-3c-control-center-owner-login`.
- **Redirect URL to add in Supabase:** `https://3c-control-center.vercel.app/**`.
- **Owner check:** after sign-in the page calls `is_owner()`; any account that is not the owner is signed out. If the check cannot be made (for example no network), nobody is signed out.
- **Sessions:** Supabase sessions that refresh themselves; "Time-box user sessions" and "Inactivity timeout" stay empty. Leaked-password protection and Confirm email: to confirm in Authentication settings (open point).
- The old home-made GitHub token function (`api/auth.ts`) and its client secret were removed on 22 Nov 2026.

## 7. Deploy

1. Change the code in the repo and commit to `main`.
2. Vercel builds and publishes by itself (`vite build`, output `dist`).
3. Environment variables are set in Vercel → Project → Settings → Environment Variables. Names are listed in `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `REACT_APP_AUTHORIZED_USER`, `REACT_APP_TIMEZONE`. Vercel also holds `VITE_SUPABASE_PROJECT_ID` and `SYSTEM_USER_ID`. **Vercel must hold both public key names, with the same anon key as the value:** `VITE_SUPABASE_ANON_KEY` (the schedule part and the login read it) and `VITE_SUPABASE_PUBLISHABLE_KEY` (the content manager and the settings tab read it). Never put the service role key in any `VITE_` variable. A new or changed variable only applies after a Redeploy. The real `.env` is never committed; the repo's old `.env` used to supply `VITE_SUPABASE_PUBLISHABLE_KEY`, and when it was removed on 22 Nov 2026 the content manager and settings went empty until the variable was added in Vercel.
4. Live check: open the dashboard in a private window. It must show the sign-in screen and nothing else until the owner signs in.
5. Local work: copy `.env.example` to `.env`, fill in the values, `npm install`, `npm run dev`.

## 8. Tests

| Check | Result |
|---|---|
| Not signed in: dashboard shows sign-in only | To run after each deploy |
| Signed in with a non-owner account is signed out | To run when the login is next opened |
| Owner signs in and the dashboard loads | To run after each deploy |
| Wrong origin blocked | Not applicable to the dashboard itself |

Chef's live save: schedule one post with service type `aurion-bot` and check it goes out and appears in `dashboard_posts` (this is the 22 Nov 2026 test of the Aurion schedule).

## 9. Open points

- Tighten the access rules of the dashboard tables to the Standard (section 4).
- Screenshot Worker: remove or rebuild (section 5).
- `simple-deploy.yml` still publishes to GitHub Pages on every push, although the live site is on Vercel: keep or remove (Chef's call).
- `package.json` and the `docs/` notes still mention old runners in places; `docs/CRON_SETUP.md` describes the removed runners.
- Confirm leaked-password protection and Confirm email in the Supabase Auth settings.
- Clean the unused Vercel variables if Chef wants a minimal list.
- The code reads the public key under two names (`VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY`). Pick one name in a later dashboard job so only one variable is needed.

## 10. Change log

| Date | Change | By |
|---|---|---|
| 22 Nov 2026 | `VITE_SUPABASE_PUBLISHABLE_KEY` added in Vercel (it had only come from the removed `.env`); noted in section 7 | Champ |
| 22 Nov 2026 | Old posting runners, Render and Railway files, `api/auth.ts`, the old posting workflow and the committed `.env` removed; `.env.example` added; three unused scripts removed from `package.json`; README.md and SETUP.md written to the Standard | Champ |
