# Handoff: Rockhouse / Sauvage Outdoors site

The site is handed over as is. This file replaces `FINAL_SHIP.md`, which dates from
September 2025 and is out of date. For what the admin dashboard does page by page, see
`USER_GUIDE.md`.

To stand the site up on your own Supabase and Vercel accounts without anything from
the previous developer, follow `SETUP.md`.

## This site is not production or launch ready

The client never provided the material the site needs to go live. Everything below is
placeholder:

- **Images**: no real photos of the client's work were ever received. The gallery, hero, and service images are stand-ins (some are hotlinked from Unsplash).
- **Reviews**: there are no real customer reviews. The testimonials are made up.
- **Prices**: the service prices are fake. The client's real prices were never provided.
- **Services and categories**: the list of services and their categories is a guess. The client's real service offering was never provided.
- **Email workspace**: never set up, so the site sends no business email (see Email below).
- **Stripe**: never set up, so no payments are processed.

Do not launch until the client supplies real content and the security items below are fixed.

## Accounts and ownership

Every account the site runs on is currently owned by Ashley Scruse. Nothing has been
transferred yet. Once the client decides who the long-term developer is and how the
site will be managed, these three need to move to accounts the client controls:

| Account | Holds | Owner now | How to transfer |
|---|---|---|---|
| GitHub `ashleyscruse/rockhouse_atl` | Source code | Ashley; jzl158 is a collaborator with write access | Repo Settings → Transfer ownership to the new owner's GitHub account |
| Vercel `rockhouse-atl` | Hosting, environment variables, deploys | Ashley (personal Hobby team) | Project Settings → General → Transfer Project. Env vars move with it; the GitHub connection must be reconnected from the new account |
| Supabase `hocbbgozruqvqqunenbt` | Database, user logins, uploaded images | Ashley | Project Settings → General → Transfer project to another organization. The person transferring must be a member of both organizations |

**There is no Firebase and no Google Cloud.** Authentication is Supabase Auth, and
every image and upload is in Supabase Storage. The code has no Firebase, Google Cloud
Storage, or other Google service.

### Managing the Supabase project

Supabase is the whole backend. Whoever owns it is responsible for:

- **Keeping it awake.** It is on Supabase's free plan, which pauses a project after about a week with no activity. A paused project takes the live site's logins, quotes, and gallery down until someone clicks Restore in the dashboard. It was paused and restored on 2026-10-18. The Pro plan does not pause.
- **Backups.** The free plan has no downloadable backups. Take your own with `pg_dump` (version 17+, through the session pooler connection string, since the direct connection is IPv6 only), and download the `media` bucket.
- **User logins** (Authentication → Users): reset passwords, remove staff who leave. The original test admin login has been removed from this file because the repo is public. Create your own admin user in your Supabase project (see `SETUP.md`).
- **Storage** (Storage → `media`): gallery and customer quote photos.
- **Keys** (Project Settings → API): the anon and service role keys live in Vercel's environment variables. If ownership changes, rotate the service role key and update Vercel.
- **Auth email**: signup confirmations and password resets go out through Supabase's built-in sender, which is heavily rate limited. Production needs custom SMTP (Authentication → Emails) from the client's email workspace.
- **Schema changes**: `src/sql/schema.sql` recreates the full schema on a fresh project. Change the schema in the Supabase dashboard or SQL editor, and save any SQL you run in `src/sql/` so it stays reproducible.

## Stack

- Next.js 15 (App Router), Tailwind, shadcn/ui
- Supabase for auth, database, and storage (project `hocbbgozruqvqqunenbt`)
- Vercel for hosting (project `rockhouse-atl`)

## Built and working

- Public pages: home, services, portfolio/gallery, about, contact, FAQ, privacy policy, terms of service
- Login, signup, and password reset through Supabase Auth
- Quote request form with image uploads
- Admin dashboard: bookings, customers, services, media, quotes, financials, team (see `USER_GUIDE.md` for what is stubbed)
- Customer and employee portal pages
- LeadConnector sales chat widget (A2P verification is complete)

## External services

Everything the site depends on outside the repo. No Google services (Cloud Storage,
Maps, Analytics) and no Firebase are used.

| Service | What it does | Status |
|---|---|---|
| GitHub `ashleyscruse/rockhouse_atl` | Source code (private) | Active |
| Vercel `rockhouse-atl` | Hosting; push to `main` auto-deploys to `rockhouse-atl.vercel.app` | Active |
| Supabase `hocbbgozruqvqqunenbt` (us-west-2) | Postgres database, auth, file storage | Active, restored 2026-10-18 (free tier pauses when idle) |
| Supabase storage bucket `media` (public) | Gallery uploads (`admin/...`) and customer quote photos (`customer-quotes/...`) | Active, 47 files |
| Supabase Auth email | Signup verification and password reset, on Supabase's built-in sender | Active, rate limited; needs custom SMTP for production |
| LeadConnector (GoHighLevel) | Sales chat widget in the homepage | Active |
| Resend | Referenced in `emailTemplates.ts` for transactional email | Not installed, no `RESEND_API_KEY` |
| Stripe / PayPal | Listed as payment methods in the admin | Not integrated, labels only |
| Unsplash | Three homepage images hotlinked | Placeholder |
| Domain `rockhouseatl.com` | Was the site's domain | Expired, see Domain below |
| Old Supabase project `yjhismyabucftxodwyxg` | Original project | Gone. All hardcoded references were removed on 2026-10-23; the app now reads Supabase settings only from environment variables |

The client's Instagram marketing (Manychat keywords, A2P texting, contact reactivation)
runs through LeadConnector outside this codebase.

### Environment variables

Set in Vercel and in `.env.local` for local dev (not in git):

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (public URL of the deployed site, used in email links)
- `RESEND_API_KEY` (not set anywhere yet)

A template is in `.env.example`.

## Database state

27 tables in `public`. Current data: 12 bookings, 10 quotes, 8 services, 24 gallery
items, 6 users, 47 files in the `media` storage bucket. No invoices or time entries.
All of it is test data.

RLS is on for every table. Read access to `quotes`, `quote_items`, `invoices`,
`invoice_line_items`, `payment_transactions`, and `project_documents` is limited to
admins and the record's own customer; `expenses`, `tax_records`, `inventory_items`, and
`inventory_transactions` are admin only. See `src/sql/tighten_read_policies.sql`
(applied 2026-10-18).

Tables the code writes to that did not exist in the original database (`contact_messages`,
`job_photos`, `job_notes`) and the `job-photos` storage bucket are all created by
`src/sql/schema.sql`, which reconstructs the whole schema for a fresh project. See `SETUP.md`.

## Known issues

### Security (fix before launch)

- **The admin API routes have no auth check.** Every route under `src/app/api/admin/` uses the service role key and never checks the session, so anyone who knows the URL can read and write bookings, invoices, payments, quotes, and team members on the live site.
- **Admin access is decided by role, not `is_admin`.** `/admin` allows the roles `Employee` and `admin_assist`, and the Team page creates every member as `Employee`, so every employee gets the full admin dashboard. Protection is client-side only (no `middleware.ts`).
- New team member temporary passwords are written to the server log in plain text (`src/app/api/admin/team/route.ts`) and generated with `Math.random()`.
- `next.config.ts` sets `ignoreBuildErrors: true`, so type errors never block a deploy.

### Broken references

Fixed 2026-10-23: the favicon, homepage background and About page images now come from `public/`; `next.config.ts` accepts images from any Supabase project; `src/lib/supabase/client.ts` has no fallback URL and fails loudly if env vars are missing; email templates build their login link from `NEXT_PUBLIC_SITE_URL`.

Still open:

- The Instagram feed calls `/api/instagram`, which does not exist.

### Roles are inconsistent

The `user_role` enum has `customer`, `employee`, `admin_assist`, `Customer`, `Employee`.
Signup creates `customer`, the Team page creates `Employee`, and different pages check
different casings, so customer search, the calendar employee filter, and the team list
each miss some users.

### Unfinished admin features

Covered section by section in `USER_GUIDE.md`. In short: Reports and Settings are
placeholders, Inventory and Projects are read-only, Calendar filters and drag-and-drop
do not work, no email is sent anywhere (quotes, invoices, team invites), and the Invoices
tab likely throws an error once an invoice exists (`getStatusColor` is out of scope at
`src/app/admin/financials/page.tsx:477`).

## Domain

The domain, `rockhouseatl.com`, has expired and is in the registrar's redemption period. It will not be
renewed. After redemption and pending delete, it can be registered fresh and pointed
at Vercel.

## Left before launch

- Real content from the client: photos, reviews, prices, services and categories
- Fix the security items above
- Set up an email provider and Stripe once the client creates the accounts
- Register a domain and connect it in Vercel
- Remove the `/supabase-test` page
- Test the customer, employee, and admin roles
- Full QA pass on mobile and the customer flows
