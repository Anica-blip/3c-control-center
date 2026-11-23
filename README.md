# 🎛️ 3C Control Center

> ⚖️ This repository is protected under a binding [Legal Disclaimer](./LEGAL_DISCLAIMER.md) that governs all use, cloning, and forking from the date of inception. Please read before use.

> The 3C Control Center is Chef's private dashboard for running the 3C Thread To Success™ community: content, scheduling, characters, chat and settings in one place. Live at https://3c-control-center.vercel.app (owner login only).

---

**⚠️ Intellectual Property Notice**
This repository is open source under the MIT License — the code skeleton is free to clone and adapt.
The 3C Thread To Success™ brand, including its name, structure, characters (Caelum, Aurion, Jan, Casey, Anica), persona system (Falcon, Panther, Wolf, Lion), philosophy, and overall ecosystem identity remains the intellectual property of the creator and is **not** included in this license.
Commercial use of the brand or replication of the ecosystem identity is not permitted without permission.

---

## 🎭 The 3C Ecosystem

This project is part of a larger system built around five core identities:

**Aurion** → Engagement & Experience — 3C Mascot, community voice, diamond-energy guide
**Caelum** → Structure & Direction — Chief Advisor, PR Manager, Brand Integrity Officer
**Jan** → Clarity & Support — Writing & Editorial Support, Lifeline Mentor & Anchor
**Casey** → Story & Play — Creative Director, Lifeline Playmaker & Ace Maven
**Anica (Founder)** → Authority & Vision — Systems Strategist, Project Architect, the Chef

Together, they create a balanced environment for growth, learning, and progression.

---

## 🎛️ What Is the 3C Control Center?

The dashboard is where Chef plans and manages what the 3C community sees. Only Chef uses it, after signing in with GitHub.

What is inside:

- **Content** — the media library, content templates and the content manager.
- **Scheduling** — a calendar and timeline of posts. A post is scheduled to a *runner* (a service type such as `aurion-bot`) and goes out at its time; sent posts are recorded in the dashboard.
- **Characters** — profiles and avatars for Aurion, Caelum and Anica, so a post can carry its character.
- **Chat** — the public web chat and its messages, and the AI chat manager.
- **Voice Studio** — the voice tools page.
- **Marketing and settings** — marketing planning pages, platforms, Telegram settings, external service links and brand assets.

---

## ⚙️ How It Is Built

| Part | What it uses |
|---|---|
| Front end | React 18 and TypeScript, built with Vite |
| Database | Supabase, project **3C Control Center** (Postgres, Auth, Storage) |
| Files | Supabase Storage (bucket `media`); Cloudflare R2 bucket `3c-control-center` for the screenshot Worker |
| Workers | `jan-assistant` (Jan, called by the dashboard) and a screenshot Worker (`screenshot-worker.js`). The Aurion Telegram posting runs in the `aurion-bot` Worker (repo `aurion-3cmascot`). |
| Hosting | Vercel (`3c-control-center`) |
| Admin access | GitHub sign-in through Supabase, owner only |

Addresses, services, settings and deploy steps are in [SETUP.md](SETUP.md).

---

## 🔐 Security and Privacy

- **Owner only.** Signing in uses GitHub through Supabase. After sign-in the dashboard asks Supabase whether the account is the owner (`is_owner()`); any other account is signed out. New sign-ups are on, so signing in alone never gives access.
- **No secrets in the repository.** Only the Supabase address and the public (browser) keys are used in the app. Secret values are never in code, files or chat; `.env` is never committed, and `.env.example` lists the names only.
- **Public chat.** Visitors of the public web chat do not sign in; the chat tables let them add messages (with size limits) and nothing else. Only the owner can read them.
- **Owner-only data.** All of the dashboard's database tables and storage buckets are owner-only, to the 3C Cooking Lab Standard. Files in the buckets still open by their address; nobody but the owner can list, add or change them.

---

## 📖 Documentation

- [SETUP.md](SETUP.md) — every connection, setting, deploy step and test, in one place
- [LEGAL_DISCLAIMER.md](LEGAL_DISCLAIMER.md) — legal terms
- `docs/` — older working notes (some describe runners that no longer exist; SETUP.md is the current record)

---

## 🎨 Credits

*Designed and Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success™ Cooking Lab* 🧪👨‍🍳

*"Think Smarter, Not Harder — Zero Shortcuts"*

---

## 👤 Creator

**Anica-blip ("Chef")**
Founder of 3C Thread To Success™ ("Cooking Lab")
Independent Creator | Community Builder

---

## 🧠 Philosophy

*"Think it. Do it. Own it."*

This project was built from vision, persistence, and a commitment to creating meaningful and structured experiences — even with minimal resources. The Control Center exists so that one founder can run a whole community calmly, from one place.
