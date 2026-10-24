# Setup: running Rockhouse on the client's own accounts

Two people are involved. **The client** creates the accounts, because they must be
in his name. **The operator** (whoever runs this repo, with the client's values in
hand) does the build-out from a terminal. Nothing here depends on the previous
developer.

- Part 1 is a checklist to send the client.
- Part 2 is what the operator runs once the values arrive.
- Part 3 is Vercel, which needs one of two access arrangements.

## Part 1: What the client does (about 20 minutes)

Send him this section as is.

### A. Create the Supabase project

1. Sign up or log in at https://supabase.com/dashboard and click **New project**.
2. Name it `rockhouse`, pick region **East US (North Virginia)**, and set a
   **database password**. Write that password down; it is needed below and
   Supabase will not show it again.
3. Wait for the project to finish provisioning (a minute or two).

### B. Collect five values and send them

Send these through a password manager share or another private channel, not plain
email or text if you can avoid it. The last two are secrets.

| # | Where to find it | What to send |
|---|---|---|
| 1 | **Project Settings → API → Project URL** | the URL, looks like `https://abcdefgh.supabase.co` |
| 2 | **Project Settings → API → Project API keys → `anon` `public`** | the long key |
| 3 | **Project Settings → API → Project API keys → `service_role`** (click Reveal) | the long key. **Secret.** |
| 4 | Top of dashboard → **Connect** button → **Session pooler** tab | the connection string. It contains `[YOUR-PASSWORD]`; either replace that with the database password from step A2 or send the password separately. **Secret.** |
| 5 | Your choice | the email address and a password (12+ characters) for the first admin login on the site |

### C. Create the Vercel account

1. Sign up at https://vercel.com using **Continue with GitHub**, with the GitHub
   account that should own the site.
2. Stop there. The operator will handle the project, or you will paste values in
   Part 3 depending on the access arrangement.

## Part 2: What the operator runs

Prerequisites: Node 20 or newer, this repo cloned, and the five values from Part 1.

### 1. Fill in `.env.local`

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every line from the client's values:

| Variable | Client value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL` | #1, same value in both |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | #2 |
| `SUPABASE_SERVICE_ROLE_KEY` | #3 |
| `DATABASE_URL` | #4, with the real password substituted for `[YOUR-PASSWORD]`. Must be port **5432**. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` | #5 |
| `NEXT_PUBLIC_SITE_URL` | leave as `http://localhost:3000` for now |

### 2. Build the database

```bash
npm install
```

```bash
npm run setup:db
```

This connects to the client's database, runs `src/sql/schema.sql` (every table,
function, storage bucket and security policy), then creates the admin login in
Supabase Auth and marks it as admin in the `user` table. It prints what it did. It is
idempotent, so rerun it freely if anything was wrong.

Expected last lines:

```
Schema applied: 27 tables in public, buckets: job-photos, media
Created auth user <email>
Admin profile ready. Log in at /login with <email>, then open /admin.
Done.
```

If it fails on connecting, the usual causes are the password still being
`[YOUR-PASSWORD]`, or the string using port 6543 (transaction pooler) instead of
5432 (session pooler).

### 3. Verify locally

```bash
npm run dev
```

Open http://localhost:3000, click **Login**, sign in with the admin email and
password, and confirm `/admin` loads. Then check `/services` and `/portfolio`
render (empty is fine; the tables exist but have no rows).

### 4. Supabase settings to set from the dashboard

These have no CLI. Either do them while logged in as the client or send him the
three lines.

- **Authentication → URL Configuration → Site URL**: the Vercel URL once it exists
  (Part 3). Add `http://localhost:3000/**` under **Redirect URLs**.
- **Authentication → Emails → SMTP Settings**: before real customers sign up, enable
  custom SMTP. The built-in sender allows a handful of emails per hour.
- **Free tier pauses after about a week idle**, which takes logins, quotes and the
  gallery down until someone clicks Restore. Upgrade to Pro before launch, or set a
  weekly reminder.

## Part 3: Vercel

Vercel's free Hobby plan has no team members, so pick one:

**Option A: the operator has the client's Vercel login (simplest).**

```bash
npx vercel login
```

```bash
npx vercel link
```

Answer: set up and deploy **yes**, scope **the client's account**, link to existing
project **no**, project name `rockhouse`, directory `./`, modify settings **no**.
Then push the env vars from `.env.local`, production only (one command per variable):

```bash
for k in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY; do grep "^$k=" .env.local | cut -d= -f2- | npx vercel env add "$k" production; done
```

```bash
npx vercel --prod
```

Copy the production URL it prints. Set it as `NEXT_PUBLIC_SITE_URL`:

```bash
echo -n "https://PASTE-URL-HERE" | npx vercel env add NEXT_PUBLIC_SITE_URL production
```

```bash
npx vercel --prod
```

Finally, in the Vercel dashboard, **Settings → Git → Connect Git Repository** and
pick `jzl158/rockhouse` (the client's GitHub needs access to the repo, or move the
repo to his account). From then on every push to `main` deploys.

**Option B: the client does it himself.** Send him this:

1. Go to https://vercel.com/new, import the GitHub repo `jzl158/rockhouse`, leave
   build settings alone.
2. Under **Environment Variables**, add these five. The operator sends the values
   (they are the same ones already in `.env.local`, minus `DATABASE_URL` and the
   `ADMIN_*` lines, which must never go into Vercel).

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_URL` | Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `NEXT_PUBLIC_SITE_URL` | leave blank, fill after first deploy |

3. Click **Deploy**. Copy the URL, set `NEXT_PUBLIC_SITE_URL` to it in
   **Settings → Environment Variables**, and redeploy.

### Domain

Vercel **Settings → Domains → Add**, follow the DNS steps. Then update
`NEXT_PUBLIC_SITE_URL` in Vercel and Site URL in Supabase to the domain and redeploy.

## What this does not cover

Launch blockers from [`HANDOFF.md`](HANDOFF.md), none of which need the previous
developer:

- The admin API routes do not check who is calling them. Fix before launch.
- Real photos, prices, services and reviews replace the placeholders.
- Stripe and Resend need accounts and keys.
- The LeadConnector chat widget ID in `src/app/page.tsx` must be the client's own.

## Where things live

| What | Where |
|---|---|
| Source code | GitHub `jzl158/rockhouse` |
| Hosting, deploys, env vars | Client's Vercel project |
| Database, logins, uploads | Client's Supabase project |
| Schema | `src/sql/schema.sql`. Save any SQL run in the dashboard into `src/sql/` |
| Rebuilding the database from scratch | `npm run setup:db` |
| Gallery and quote photos | Supabase Storage bucket `media` |
| Employee job photos | Supabase Storage bucket `job-photos` |
