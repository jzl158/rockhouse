#!/usr/bin/env node
// Applies src/sql/schema.sql to a Supabase project and creates the first admin
// user. Reads everything from .env.local. Safe to run more than once.
//
//   npm run setup:db
//
// Required in .env.local:
//   DATABASE_URL                 session-pooler connection string (port 5432)
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// Optional (creates/promotes the admin login when both are set):
//   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
if (!existsSync(envPath)) fail(`No .env.local found. Copy .env.example to .env.local and fill it in.`);
process.loadEnvFile(envPath);

const need = (k) => process.env[k] || fail(`${k} is not set in .env.local`);
const DATABASE_URL = need("DATABASE_URL");
const SUPABASE_URL = need("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_KEY = need("SUPABASE_SERVICE_ROLE_KEY");

if (/\[YOUR-PASSWORD\]|YOUR-PROJECT-REF/.test(DATABASE_URL + SUPABASE_URL)) {
  fail("DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL still contains a placeholder.");
}
if (/:6543\//.test(DATABASE_URL)) {
  console.warn("Warning: DATABASE_URL uses port 6543 (transaction pooler). Use the session pooler (port 5432); the transaction pooler cannot run multi-statement SQL.");
}

// 1. Schema ---------------------------------------------------------------------
const schemaPath = resolve(root, "src/sql/schema.sql");
const schema = readFileSync(schemaPath, "utf8");
const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

console.log(`Connecting to database...`);
await client.connect().catch((e) => fail(`Could not connect: ${e.message}`));

const { rows: [{ version }] } = await client.query("select version()");
console.log(`Connected: ${version.split(",")[0]}`);

console.log(`Applying ${schemaPath.replace(root + "/", "")}...`);
try {
  await client.query(schema);
} catch (e) {
  await client.end();
  fail(`Schema failed: ${e.message}${e.position ? ` (at character ${e.position})` : ""}\n${e.hint ?? ""}`);
}

const { rows: tables } = await client.query(
  "select count(*)::int as n from pg_tables where schemaname = 'public'"
);
const { rows: buckets } = await client.query("select id from storage.buckets order by id");
console.log(`Schema applied: ${tables[0].n} tables in public, buckets: ${buckets.map((b) => b.id).join(", ")}`);

// 2. Admin user -----------------------------------------------------------------
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin user. Set them and rerun to create one.");
} else {
  if (password.length < 12) fail("ADMIN_PASSWORD must be at least 12 characters.");
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  let userId;
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    if (/already|exists|registered/i.test(error.message)) {
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) fail(`Could not list users: ${listErr.message}`);
      userId = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
      if (!userId) fail(`User ${email} exists but could not be found via the admin API.`);
      console.log(`Auth user ${email} already exists, promoting to admin.`);
    } else {
      fail(`Could not create auth user: ${error.message}`);
    }
  } else {
    userId = created.user.id;
    console.log(`Created auth user ${email}`);
  }

  await client.query(
    `insert into "user" (id, email, "firstName", "lastName", role, is_admin, is_active)
     values ($1, $2, $3, $4, 'admin_assist', true, true)
     on conflict (id) do update set is_admin = true, is_active = true, role = 'admin_assist'`,
    [userId, email, process.env.ADMIN_FIRST_NAME ?? "Admin", process.env.ADMIN_LAST_NAME ?? ""]
  );
  console.log(`Admin profile ready. Log in at /login with ${email}, then open /admin.`);
}

await client.end();
console.log("Done.");

function fail(msg) {
  console.error(`\nError: ${msg}`);
  process.exit(1);
}
