# Setup: running Rockhouse on your own accounts

This guide takes the code in this repo and stands it up on a Supabase project and a
Vercel project that you own. It assumes nothing from the previous developer: no
transfers, no shared logins. Budget about 45 minutes.

You need: a GitHub account with access to this repo, a Supabase account, a Vercel
account. All three have free tiers that are enough to start.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard and click **New project**.
2. Pick your organization, name it (for example `rockhouse`), set a strong database
   password and save it somewhere safe, choose the region closest to Atlanta
   (`us-east-1`), and click **Create new project**. Wait for it to finish provisioning.
3. Open **SQL Editor** in the left sidebar, click **New query**, paste the entire
   contents of [`src/sql/schema.sql`](src/sql/schema.sql), and click **Run**.
   It creates every table, function, storage bucket and security policy the app
   needs. It is safe to run more than once.
4. Open **Project Settings → API** and copy three values. You will paste them into
   Vercel and into `.env.local` in the next steps:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key
   - **service_role** key. Treat this one like a password. It bypasses every
     security rule.

### Create your admin login

1. Open **Authentication → Users → Add user → Create new user**. Enter your email
   and a password, tick **Auto Confirm User**, and create it.
2. Click the new user and copy its **UID**.
3. Back in **SQL Editor**, run this with your values filled in:

   ```sql
   insert into "user" (id, email, "firstName", "lastName", role, is_admin, is_active)
   values ('PASTE-UID-HERE', 'you@example.com', 'First', 'Last', 'admin_assist', true, true);
   ```

You can now log in at `/login` on the site and reach `/admin`.

### Supabase settings worth changing now

- **Authentication → URL Configuration**: set **Site URL** to your Vercel URL once
  you have it (step 2), and add `http://localhost:3000/**` to **Redirect URLs** for
  local development. Password-reset emails link to the Site URL.
- **Authentication → Emails**: the built-in sender is limited to a few emails per
  hour. Before real customers sign up, add **Custom SMTP** from your email provider.
- **Free tier pauses after about a week idle.** When that happens logins, quotes and
  the gallery stop working until you click **Restore** in the dashboard. The Pro
  plan does not pause. Set a calendar reminder or upgrade before launch.
- **Backups**: the free tier has none. The Pro plan has daily backups.

## 2. Create the Vercel project

1. Go to https://vercel.com/new and import the GitHub repo `jzl158/rockhouse`
   (or your fork of it). Vercel detects Next.js automatically. Leave the build
   settings at their defaults.
2. Before clicking Deploy, expand **Environment Variables** and add these, using the
   values you copied from Supabase. Apply each to Production, Preview and Development.

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon public key |
   | `SUPABASE_URL` | your Project URL again |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now, fill in after first deploy |

3. Click **Deploy**. The first build takes two or three minutes.
4. Copy the deployment URL (something like `https://rockhouse-xyz.vercel.app`),
   go to **Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to it (no
   trailing slash), and redeploy from the **Deployments** tab.
5. Put the same URL into Supabase under **Authentication → URL Configuration → Site URL**.

From now on every push to `main` deploys automatically.

## 3. Run it locally (optional)

```bash
cp .env.example .env.local
```

Fill in `.env.local` with the same values as the Vercel table above and
`NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Then:

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. The app refuses to start if the two
`NEXT_PUBLIC_SUPABASE_*` values are missing, so a blank page with an error in the
terminal means `.env.local` is not filled in.

## 4. Connect a domain

In Vercel, **Settings → Domains → Add**, enter the domain, and follow the DNS
instructions it shows. Then update `NEXT_PUBLIC_SITE_URL` in Vercel and the Site URL
in Supabase to the new domain and redeploy.

## 5. What this does not cover

These are the remaining launch blockers described in [`HANDOFF.md`](HANDOFF.md).
None of them need anything from the previous developer.

- The admin API routes do not check who is calling them. Fix before launch.
- Real photos, prices, services and reviews replace the placeholders.
- Payments (Stripe) and transactional email (Resend) need accounts and keys.
- The LeadConnector chat widget on the homepage is hardcoded to one widget ID in
  `src/app/page.tsx`. Replace it with your own or remove it.

## Where things live

| What | Where |
|---|---|
| Source code | GitHub `jzl158/rockhouse` |
| Hosting, deploys, environment variables | Your Vercel project |
| Database, logins, uploaded images | Your Supabase project |
| Database schema | `src/sql/schema.sql` in this repo. Save any SQL you run in the dashboard into `src/sql/` so the schema stays reproducible |
| Gallery and quote photos | Supabase Storage, bucket `media` |
| Employee job photos | Supabase Storage, bucket `job-photos` |
