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
| **Supabase**, project **3C Control Center** (`uqyqpwhkzlhqxcqajhkn`) | Database, sign-in (Auth) and 7 Storage buckets (including `media`). No edge functions: all were deleted on 23 Nov 2026 (the dashboard web chat is only a skeleton); they are rebuilt only if the UI work needs them. |
| **Vercel**, project `3c-control-center` | Hosts the dashboard. Builds with `vite build`. |
| **GitHub** (`Anica-blip/3c-control-center`) | The code. Sign-in provider for the dashboard (through Supabase). GitHub Actions workflows, see below. |
| **Cloudflare** | Worker `jan-assistant` (Jan; its own repo and register row B-5). A screenshot Worker built from `screenshot-worker.js` and `wrangler.toml` (R2 bucket `3c-control-center`). |
| **Telegram** | Not called from this repo. Posts are sent by the `aurion-bot` Worker. |

Removed on 22–23 Nov 2026 and no longer used: all 28 Supabase edge functions, the workflows `simple-deploy.yml` and `check-email-counts.yml` (deleted by Chef 23 Nov), Render (cron job and bot), the Vercel cron gateway (`cron-gateway-auth`), Railway, the old posting runners in this repo (`render-cron.ts`, `railway-server.ts`, and the `process-scheduled-posts` workflow), the unused `api/auth.ts` function, and the committed `.env`.

**GitHub Actions in `.github/workflows/`:**

| Workflow | What it does | Secrets it reads (names only) |
|---|---|---|
| `cloudflare-screenshot-worker.yml` | Deploys the screenshot Worker when `screenshot-worker.js` or `wrangler.toml` changes | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` |
| `screenshot processor.yml` | Takes external-page screenshots into R2 (started by hand or by the screenshot Worker) | `R2_ACCESS_KEY_ID`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_SECRET_ACCESS_KEY`, `SUPABASE_SERVICE_KEY`, `SUPABASE_URL` |

## 4. Supabase (project 3C Control Center)

Tables the dashboard touches: `content_posts`, `scheduled_posts`, `dashboard_posts`, `dashboard_platform_assignments`, `post_platforms`, `character_profiles`, `social_platforms`, `telegram_configurations`, `dashboard_templates`, `external_services`, `media_content`, `pending_content_library`, `daily_schedule_prompts`, `brand_colors`, `brand_font`, `brand_guidelines`, `brand_logos`, `public_chat_sessions`, `public_chat_messages`.

- Row Level Security is **on** for all of them, and since 22–23 Nov 2026 all 34 public tables are **owner-only** (`is_owner()`), as the Standard requires (section B). Chef signs in through the dashboard; any other signed-in account sees and changes nothing; visitors have no access.
- `public_chat_sessions` and `public_chat_messages`: visitors do not sign in; they can only **add** chat rows (with size limits). Only the owner reads them.
- `scheduled_posts` and `dashboard_posts`: owner-only; the `aurion-bot` Worker reaches them with its service key. `dashboard_posts` also has one extra owner-read rule.
- The code also refers to `avatars`, `diagnostic_logs`, `pending_schedule`, `social_platforms_content` and `telegram_channels`, which do not exist as tables in the project today. (`media` is a Storage bucket.)
- **Storage:** all 7 buckets are owner-only for writing and listing; files still open by their address.
- **Functions:** `is_owner()` (owner check at sign-in) and `increment_template_usage` (owner or service key only). 28 functions now have a fixed search path; 9 security-definer functions can no longer be run by visitors or signed-in accounts. There are no edge functions. The folder `supabase/function/ai-chat` stays in the repo as a record only.
- **Migrations:** the lock-down of 22–23 Nov 2026 is saved in `supabase/migrations/`, one named file per table, bucket and function change, each with a rollback file.
- Table lists of the bot (`faq`, `fact`, `keyword`, `greeted_users`, `about_3c`) live in the same project and are documented in the `aurion-3cmascot` repo. `faq` and `fact` carry an older read rule (user id equals the row's `user_id`); every row has no `user_id`, so it matches nothing and only the bot's service key can read them. `keyword` has the owner-only rule. This is as designed and is explained in the `aurion-3cmascot` SETUP.md (settled with Chef, 23 Nov 2026).
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
- **Sessions:** Supabase sessions that refresh themselves; "Time-box user sessions" and "Inactivity timeout" stay empty. Leaked-password protection is **on** (Chef, 23 Nov 2026; it is a Pro plan feature and switches off if the plan is cancelled). Confirm email: to confirm in Authentication settings.
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
| Tables and buckets: visitor refused, other signed-in account refused, owner allowed, service key allowed (all rolled back) | Passed 22–23 Nov 2026 |
| Aurion schedule live test: post at 08:30 on 23 Nov 2026 went out; `scheduled_posts` stayed 0, `dashboard_posts` 14 to 15 | Passed, confirmed by Chef |
| Not signed in: dashboard shows sign-in only | To run after each deploy |
| Signed in with a non-owner account is signed out | To run when the login is next opened |
| Wrong origin blocked | Not applicable to the dashboard itself |

## 9. Open points

- Screenshot Worker: remove or rebuild (section 5).
- 11 pending rows in `dashboard_posts` (a code problem, to correct in a later dashboard job).
- `package.json` and the `docs/` notes still mention old runners in places; `docs/CRON_SETUP.md` describes the removed runners.
- Confirm Confirm email in the Supabase Auth settings.
- Remove the unused Vercel variable `VITE_SUPABASE_PUBLISHABLE_KEY` only after one public key name is chosen in code (the code reads the public key under two names, `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY`; a later dashboard job picks one).
- Later dashboard job: Telegram HTML formatting; the clean-up screen layout; handling of broken images in analytics (`media_removed_at`).
- Supabase Pro plan: Chef plans to cancel after the bill around 4 Dec 2026; export the data first.

## 10. Change log

| Date | Change | By |
|---|---|---|
| 23 Nov 2026 | All 34 tables, 7 buckets and the risky functions brought to owner-only; all 28 edge functions and two workflows deleted by Chef; leaked-password protection on; SETUP.md sections 3, 4, 6, 8 and 9 updated; README security section updated. (SETUP.md had been overwritten with the Aurion bot's file by mistake on 23 Nov and was rebuilt from the 22 Nov version) | Champ |
| 22 Nov 2026 | `VITE_SUPABASE_PUBLISHABLE_KEY` added in Vercel (it had only come from the removed `.env`); noted in section 7 | Champ |
| 22 Nov 2026 | Old posting runners, Render and Railway files, `api/auth.ts`, the old posting workflow and the committed `.env` removed; `.env.example` added; three unused scripts removed from `package.json`; README.md and SETUP.md written to the Standard | Champ |
