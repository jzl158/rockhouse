-- =============================================================================
-- Rockhouse / Sauvage Outdoors - full database schema for a fresh Supabase project
-- =============================================================================
-- Paste this whole file into the Supabase SQL editor of a NEW project and run it.
-- It is idempotent: running it twice is safe.
--
-- HOW THIS FILE WAS MADE
-- The original database had no migration files. The table definitions below were
-- reconstructed on 2026-10-23 from the generated types in
-- src/types/database.types.ts, plus the two SQL files that did exist
-- (time_entries_table.sql, tighten_read_policies.sql), plus the columns the
-- application code writes. Column types are inferred (uuid for ids, timestamptz
-- for *_at, date for *_date, numeric for money) and may differ from the original
-- in precision. Where the original column had a database default whose value is
-- unknown, there is a comment on the column. Review the RLS section before launch.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
-- The original enum carried both casings. Kept as is so existing code keeps
-- working; normalizing to lowercase is on the launch to-do list.
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('customer', 'employee', 'admin_assist', 'Customer', 'Employee');
  end if;
  if not exists (select 1 from pg_type where typname = 'role_type') then
    create type role_type as enum ('Customer', 'Employee');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Tables (from database.types.ts)
-- -----------------------------------------------------------------------------
-- "user" is the app profile table. Its id IS the Supabase Auth user id: the
-- signup form inserts a row here with the id returned by auth.signUp().
create table if not exists "user" (
  id uuid primary key references auth.users (id) on delete cascade,
  address text,
  created_at timestamptz default now(),
  email text not null,
  "firstName" text,
  hire_date date,
  is_active boolean,
  is_admin boolean,
  "lastName" text,
  password_hash text,
  phone text,
  points integer,
  position text,
  referral_code text,
  referral_credits integer,
  role user_role,
  specialties jsonb,
  updated_at timestamptz default now()
);

create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  date date not null,
  day_of_week integer,
  end_time time not null,
  is_available boolean,
  notes text,
  recurring boolean,
  start_time time not null,
  updated_at timestamptz default now(),
  user_id uuid,
  constraint availability_user_id_fkey foreign key (user_id) references "user" (id) on delete set null
);

create table if not exists booking (
  id uuid primary key default gen_random_uuid(),
  amount_due numeric,
  amount_paid numeric,
  assigned_employee_id uuid,
  assignment_date date,
  created_at timestamptz default now(),
  customer_address text,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  deposit_required numeric,
  estimated_value numeric,
  images jsonb,
  notes text,
  payment_status text,
  preferred_date date,
  reference_number text not null,
  referral_code_used text,
  service_cost numeric,
  service_details text,
  service_type text not null,
  status text,
  user_id uuid,
  constraint booking_user_id_fkey foreign key (user_id) references "user" (id) on delete set null
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  approved_by uuid,
  booking_id uuid,
  category text not null,
  created_at timestamptz default now(),
  created_by uuid not null,
  description text not null,
  expense_date date not null,
  payment_method text,
  receipt_path text,
  reimbursable boolean,
  status text,
  tax_amount numeric,
  vendor text,
  constraint expenses_approved_by_fkey foreign key (approved_by) references "user" (id) on delete cascade,
  constraint expenses_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint expenses_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade
);

create table if not exists gallery_item (
  id uuid primary key default gen_random_uuid(),
  before_image_id uuid,
  category text not null,
  completion_date date,
  created_at timestamptz default now(),
  description text,
  file_path text not null,
  file_type text not null,
  is_before_after boolean,
  is_featured boolean,
  is_first boolean,
  location text,
  project_type text,
  title text not null,
  updated_at timestamptz default now(),
  constraint gallery_item_before_image_id_fkey foreign key (before_image_id) references gallery_item (id) on delete cascade
);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  condition text,
  cost_per_unit numeric,
  created_at timestamptz default now(),
  created_by uuid not null,
  description text,
  last_maintenance_date date,
  last_ordered_date date,
  last_received_date date,
  location text,
  max_stock_level integer,
  min_stock_level integer,
  name text not null,
  next_maintenance_date date,
  notes text,
  quantity_in_stock numeric not null default 0,
  reorder_point integer,
  sku text,
  status text,
  supplier_contact text,
  supplier_email text,
  supplier_name text,
  supplier_phone text,
  unit text not null,
  updated_at timestamptz default now(),
  updated_by uuid,
  warranty_expiry_date date,
  constraint inventory_items_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade,
  constraint inventory_items_updated_by_fkey foreign key (updated_by) references "user" (id) on delete cascade
);

create table if not exists inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  created_at timestamptz default now(),
  created_by uuid not null,
  inventory_item_id uuid not null,
  location_from text,
  location_to text,
  notes text,
  project_name text,
  quantity integer not null,
  reason text,
  supplier_invoice_number text,
  total_cost numeric,
  transaction_date date,
  transaction_type text not null,
  unit_cost numeric,
  constraint inventory_transactions_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint inventory_transactions_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade,
  constraint inventory_transactions_inventory_item_id_fkey foreign key (inventory_item_id) references inventory_items (id) on delete cascade
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  created_at timestamptz default now(),
  created_by uuid not null,
  discount_amount numeric,
  due_date date not null,
  invoice_number text not null,
  issue_date date not null,
  notes text,
  status text,
  subtotal numeric not null,
  tax_amount numeric,
  terms text,
  total_amount numeric not null,
  constraint invoices_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint invoices_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade
);

create table if not exists invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  description text not null,
  invoice_id uuid not null,
  item_type text,
  quantity integer not null,
  tax_rate numeric,
  total_price numeric not null,
  unit_price numeric not null,
  constraint invoice_line_items_invoice_id_fkey foreign key (invoice_id) references invoices (id) on delete cascade
);

create table if not exists job_assignment (
  id uuid primary key default gen_random_uuid(),
  assigned_by uuid,
  assigned_date date,
  booking_id uuid not null,
  created_at timestamptz default now(),
  employee_id uuid,
  end_time time,
  job_address text,
  notes text,
  role text,
  start_time time,
  status text,
  updated_at timestamptz default now(),
  constraint job_assignment_assigned_by_fkey foreign key (assigned_by) references "user" (id) on delete cascade,
  constraint job_assignment_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint job_assignment_employee_id_fkey foreign key (employee_id) references "user" (id) on delete set null
);

create table if not exists project_phases (
  id uuid primary key default gen_random_uuid(),
  assigned_to uuid,
  booking_id uuid not null,
  completion_date date,
  created_at timestamptz default now(),
  created_by uuid not null,
  dependencies text[],
  description text,
  due_date date,
  order_number numeric not null,
  phase_name text not null,
  start_date date,
  status text,
  updated_at timestamptz default now(),
  constraint project_phases_assigned_to_fkey foreign key (assigned_to) references "user" (id) on delete cascade,
  constraint project_phases_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint project_phases_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade
);

create table if not exists material_usage (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  inventory_item_id uuid not null,
  notes text,
  phase_id uuid,
  quantity_used numeric not null,
  recorded_by uuid not null,
  total_cost numeric,
  unit text not null,
  unit_cost numeric,
  usage_date date,
  constraint material_usage_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint material_usage_inventory_item_id_fkey foreign key (inventory_item_id) references inventory_items (id) on delete cascade,
  constraint material_usage_phase_id_fkey foreign key (phase_id) references project_phases (id) on delete cascade,
  constraint material_usage_recorded_by_fkey foreign key (recorded_by) references "user" (id) on delete cascade
);

create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  booking_id uuid,
  created_at timestamptz default now(),
  created_by uuid not null,
  invoice_id uuid,
  notes text,
  payment_method text not null,
  payment_provider text,
  provider_transaction_id uuid,
  transaction_date date not null,
  transaction_reference text,
  transaction_status text not null,
  constraint payment_transactions_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint payment_transactions_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade,
  constraint payment_transactions_invoice_id_fkey foreign key (invoice_id) references invoices (id) on delete cascade
);

create table if not exists project_documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  description text,
  document_type text not null,
  file_path text not null,
  file_size numeric,
  file_type text not null,
  status text,
  title text not null,
  uploaded_at timestamptz,
  uploaded_by uuid not null,
  version text,
  constraint project_documents_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint project_documents_uploaded_by_fkey foreign key (uploaded_by) references "user" (id) on delete cascade
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  created_at timestamptz default now(),
  created_by uuid not null,
  customer_address text,
  customer_email text not null,
  customer_id uuid,
  customer_name text not null,
  customer_phone text,
  discount_amount numeric,
  discount_type text,
  estimated_duration text,
  is_template boolean,
  notes text,
  project_start_date date,
  reference_number text not null,
  service_description text,
  service_type text not null,
  status text,
  subtotal numeric,
  tax_amount numeric,
  tax_rate numeric,
  template_name text,
  terms_conditions text,
  total_amount numeric,
  updated_at timestamptz default now(),
  valid_until text not null,
  constraint quotes_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint quotes_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade,
  constraint quotes_customer_id_fkey foreign key (customer_id) references "user" (id) on delete set null
);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  description text not null,
  item_type text not null,
  notes text,
  "order" numeric,
  quantity integer,
  quote_id uuid not null,
  total_price numeric,
  unit text not null,
  unit_price numeric,
  constraint quote_items_quote_id_fkey foreign key (quote_id) references quotes (id) on delete cascade
);

create table if not exists referral (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  created_at timestamptz default now(),
  credit_amount numeric,
  referral_code text,
  referred_email text,
  referrer_id uuid not null,
  status text,
  constraint referral_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint referral_referrer_id_fkey foreign key (referrer_id) references "user" (id) on delete cascade
);

create table if not exists report_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  created_by uuid not null,
  description text,
  is_system_template boolean,
  name text not null,
  report_type text not null,
  template_config jsonb not null,
  updated_at timestamptz default now(),
  constraint report_templates_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade
);

create table if not exists saved_reports (
  id uuid primary key default gen_random_uuid(),
  column_config jsonb,
  created_at timestamptz default now(),
  created_by uuid not null,
  description text,
  filter_criteria jsonb,
  last_run_at timestamptz,
  name text not null,
  sort_criteria jsonb,
  template_id uuid,
  constraint saved_reports_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade,
  constraint saved_reports_template_id_fkey foreign key (template_id) references report_templates (id) on delete cascade
);

create table if not exists report_schedules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  created_by uuid not null,
  frequency text not null,
  is_active boolean,
  last_run_at timestamptz,
  next_run_at timestamptz,
  recipient_emails text[],
  saved_report_id uuid not null,
  schedule_config jsonb not null,
  constraint report_schedules_created_by_fkey foreign key (created_by) references "user" (id) on delete cascade,
  constraint report_schedules_saved_report_id_fkey foreign key (saved_report_id) references saved_reports (id) on delete cascade
);

create table if not exists service (
  id uuid primary key default gen_random_uuid(),
  base_price numeric,
  category text[] not null,
  description text,
  name text not null
);

create table if not exists tax_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  created_at timestamptz default now(),
  invoice_id uuid,
  jurisdiction text,
  month numeric,
  quarter numeric,
  tax_amount numeric not null,
  tax_category text not null,
  tax_rate numeric not null,
  tax_year numeric not null,
  taxable_amount numeric not null,
  transaction_date date not null,
  updated_at timestamptz default now(),
  constraint tax_records_booking_id_fkey foreign key (booking_id) references booking (id) on delete cascade,
  constraint tax_records_invoice_id_fkey foreign key (invoice_id) references invoices (id) on delete cascade
);

-- time_entries: the code (src/app/employee/page.tsx) uses clock_in / clock_out /
-- total_hours, matching src/sql/time_entries_table.sql, so that definition wins
-- over the stale one in database.types.ts.
create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references "user"(id) on delete cascade,
  booking_id uuid references booking(id) on delete set null,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  total_hours numeric(5,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_time_entries_employee_id on time_entries(employee_id);
create index if not exists idx_time_entries_clock_in on time_entries(clock_in);
create index if not exists idx_time_entries_booking_id on time_entries(booking_id);

-- -----------------------------------------------------------------------------
-- Tables the code writes to that never existed in the original database
-- -----------------------------------------------------------------------------
-- Columns taken from the insert() calls in the code.

-- General questions from the contact form (src/app/api/contact/route.ts)
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- Photos employees upload on a job (src/app/employee/page.tsx)
create table if not exists job_photos (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references booking(id) on delete cascade,
  employee_id uuid references "user"(id) on delete set null,
  file_path text not null,
  file_name text not null,
  uploaded_at timestamptz not null default now()
);

-- Notes employees leave on a job (src/app/employee/page.tsx)
create table if not exists job_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references booking(id) on delete cascade,
  employee_id uuid references "user"(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

-- Backing store for the service-category RPCs below
create table if not exists service_categories (
  name text primary key,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes on the most-queried foreign keys
-- -----------------------------------------------------------------------------
create index if not exists idx_booking_user_id on booking(user_id);
create index if not exists idx_booking_status on booking(status);
create index if not exists idx_quotes_customer_id on quotes(customer_id);
create index if not exists idx_quotes_customer_email on quotes(customer_email);
create index if not exists idx_quotes_booking_id on quotes(booking_id);
create index if not exists idx_quote_items_quote_id on quote_items(quote_id);
create index if not exists idx_invoices_booking_id on invoices(booking_id);
create index if not exists idx_invoice_line_items_invoice_id on invoice_line_items(invoice_id);
create index if not exists idx_payment_transactions_booking_id on payment_transactions(booking_id);
create index if not exists idx_job_assignment_booking_id on job_assignment(booking_id);
create index if not exists idx_job_assignment_employee_id on job_assignment(employee_id);
create index if not exists idx_job_photos_booking_id on job_photos(booking_id);
create index if not exists idx_job_notes_booking_id on job_notes(booking_id);
create index if not exists idx_gallery_item_category on gallery_item(category);

-- -----------------------------------------------------------------------------
-- Functions
-- -----------------------------------------------------------------------------

-- updated_at maintenance
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  for t in select unnest(array['user','availability','gallery_item','inventory_items','job_assignment',
                              'project_phases','quotes','report_templates','tax_records','time_entries'])
  loop
    execute format('drop trigger if exists set_updated_at on %I', t);
    execute format('create trigger set_updated_at before update on %I for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- Role helpers used by RLS. security definer so they can read "user" without
-- recursing into that table's own policies.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from "user" where id = auth.uid()), false);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select is_admin = true or role in ('employee', 'Employee', 'admin_assist')
    from "user" where id = auth.uid()
  ), false);
$$;

-- Service categories. Called from the admin Services, Media and Settings pages.
-- Returns every category ever added plus any already in use on a service.
create or replace function public.get_service_categories()
returns text[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct c order by c), '{}'::text[])
  from (
    select name as c from service_categories
    union
    select unnest(category) from service
  ) s;
$$;

create or replace function public.add_service_category(new_cat text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then
    raise exception 'Only staff can add service categories';
  end if;
  insert into service_categories(name) values (trim(new_cat)) on conflict do nothing;
  return trim(new_cat);
end $$;

-- -----------------------------------------------------------------------------
-- Storage buckets
-- -----------------------------------------------------------------------------
-- media:      gallery uploads (admin/...) and customer quote photos (customer-quotes/...)
-- job-photos: photos employees take on site
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('job-photos', 'job-photos', true)
  on conflict (id) do update set public = true;

drop policy if exists "Public read media" on storage.objects;
create policy "Public read media" on storage.objects for select
  using (bucket_id in ('media', 'job-photos'));

-- The public quote form uploads photos before the request is submitted, so
-- anonymous uploads are allowed only into media/customer-quotes/.
drop policy if exists "Anyone can upload customer quote photos" on storage.objects;
create policy "Anyone can upload customer quote photos" on storage.objects for insert
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'customer-quotes');

drop policy if exists "Staff manage media" on storage.objects;
create policy "Staff manage media" on storage.objects for all to authenticated
  using (bucket_id in ('media', 'job-photos') and public.is_staff())
  with check (bucket_id in ('media', 'job-photos') and public.is_staff());

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- Admin API routes (src/app/api/admin/*) use the service role key and bypass
-- RLS. Everything the browser does goes through these policies.
-- Pattern: public site reads services and gallery; customers see their own
-- records; staff (employees + admins) run the operational tables; only admins
-- see the books (expenses, taxes, inventory, reports).

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- user ------------------------------------------------------------------------
drop policy if exists "Read own profile or staff" on "user";
create policy "Read own profile or staff" on "user" for select to authenticated
  using (id = auth.uid() or public.is_staff());
drop policy if exists "Create own profile" on "user";
create policy "Create own profile" on "user" for insert to authenticated
  with check (id = auth.uid());
drop policy if exists "Update own profile or admin" on "user";
create policy "Update own profile or admin" on "user" for update to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists "Admins delete users" on "user";
create policy "Admins delete users" on "user" for delete to authenticated
  using (public.is_admin());

-- public catalogue ------------------------------------------------------------
drop policy if exists "Anyone reads services" on service;
create policy "Anyone reads services" on service for select using (true);
drop policy if exists "Staff manage services" on service;
create policy "Staff manage services" on service for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Anyone reads gallery" on gallery_item;
create policy "Anyone reads gallery" on gallery_item for select using (true);
drop policy if exists "Staff manage gallery" on gallery_item;
create policy "Staff manage gallery" on gallery_item for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Anyone reads categories" on service_categories;
create policy "Anyone reads categories" on service_categories for select using (true);

-- bookings and jobs -----------------------------------------------------------
drop policy if exists "Read own bookings or staff" on booking;
create policy "Read own bookings or staff" on booking for select to authenticated
  using (user_id = auth.uid() or customer_email = (auth.jwt() ->> 'email') or public.is_staff());
drop policy if exists "Staff manage bookings" on booking;
create policy "Staff manage bookings" on booking for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage job assignments" on job_assignment;
create policy "Staff manage job assignments" on job_assignment for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage availability" on availability;
create policy "Staff manage availability" on availability for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage job photos" on job_photos;
create policy "Staff manage job photos" on job_photos for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage job notes" on job_notes;
create policy "Staff manage job notes" on job_notes for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage project phases" on project_phases;
create policy "Staff manage project phases" on project_phases for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage material usage" on material_usage;
create policy "Staff manage material usage" on material_usage for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage referrals" on referral;
create policy "Staff manage referrals" on referral for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- time entries (from time_entries_table.sql, admin check widened to is_admin()) --
drop policy if exists "Own time entries" on time_entries;
create policy "Own time entries" on time_entries for all to authenticated
  using (employee_id = auth.uid()) with check (employee_id = auth.uid());
drop policy if exists "Admins read all time entries" on time_entries;
create policy "Admins read all time entries" on time_entries for select to authenticated
  using (public.is_admin());

-- quotes, invoices, payments (from tighten_read_policies.sql) -------------------
drop policy if exists "Read own quotes or admin" on quotes;
create policy "Read own quotes or admin" on quotes for select to authenticated using (
  public.is_admin() or customer_id = auth.uid() or created_by = auth.uid()
  or customer_email = (auth.jwt() ->> 'email')
);
drop policy if exists "Staff manage quotes" on quotes;
create policy "Staff manage quotes" on quotes for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Read own quote items or admin" on quote_items;
create policy "Read own quote items or admin" on quote_items for select to authenticated
  using (exists (select 1 from quotes q where q.id = quote_items.quote_id));
drop policy if exists "Staff manage quote items" on quote_items;
create policy "Staff manage quote items" on quote_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Read own invoices or admin" on invoices;
create policy "Read own invoices or admin" on invoices for select to authenticated using (
  public.is_admin()
  or exists (select 1 from booking b where b.id = invoices.booking_id and b.user_id = auth.uid())
);
drop policy if exists "Read own invoice items or admin" on invoice_line_items;
create policy "Read own invoice items or admin" on invoice_line_items for select to authenticated
  using (exists (select 1 from invoices i where i.id = invoice_line_items.invoice_id));

drop policy if exists "Read own payments or admin" on payment_transactions;
create policy "Read own payments or admin" on payment_transactions for select to authenticated using (
  public.is_admin()
  or exists (select 1 from booking b where b.id = payment_transactions.booking_id and b.user_id = auth.uid())
);

drop policy if exists "Read own project documents or admin" on project_documents;
create policy "Read own project documents or admin" on project_documents for select to authenticated using (
  public.is_admin()
  or exists (select 1 from booking b where b.id = project_documents.booking_id and b.user_id = auth.uid())
);
drop policy if exists "Staff manage project documents" on project_documents;
create policy "Staff manage project documents" on project_documents for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- internal books: admin only ----------------------------------------------------
do $$
declare t text;
begin
  for t in select unnest(array['expenses','tax_records','inventory_items','inventory_transactions',
                              'report_templates','saved_reports','report_schedules','contact_messages'])
  loop
    execute format('drop policy if exists "Admins manage %s" on %I', t, t);
    execute format('create policy "Admins manage %s" on %I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Done. Next: create your first admin user (see SETUP.md), then run
--   update "user" set is_admin = true, role = 'admin_assist' where email = 'you@example.com';
-- -----------------------------------------------------------------------------
