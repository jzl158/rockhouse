-- Replace "any logged-in user can read everything" SELECT policies with
-- admin + record-owner reads. Admin API routes use the service role key and
-- bypass RLS, so they are unaffected.

begin;

-- Drop the open read policies
drop policy "Enable read access for authenticated users" on quotes;
drop policy "Enable read access for authenticated users" on quote_items;
drop policy "Enable read access for authenticated users" on invoices;
drop policy "Enable read access for authenticated users" on invoice_line_items;
drop policy "Enable read access for authenticated users" on expenses;
drop policy "Enable read access for authenticated users" on tax_records;
drop policy "Enable read access for authenticated users" on payment_transactions;
drop policy "Enable read access for authenticated users" on project_documents;
drop policy "Enable read access for authenticated users" on inventory_items;
drop policy "Enable read access for authenticated users" on inventory_transactions;

-- Quotes: admin, creator, or the customer (by id or email; the customer page matches on email)
create policy "Read own quotes or admin" on quotes for select to authenticated using (
  exists (select 1 from "user" u where u.id = auth.uid() and u.is_admin = true)
  or customer_id = auth.uid()
  or created_by = auth.uid()
  or customer_email = (auth.jwt() ->> 'email')
);

create policy "Read own quote items or admin" on quote_items for select to authenticated using (
  exists (select 1 from quotes q where q.id = quote_items.quote_id)
);

-- Invoices and payments: admin, or the customer who owns the booking
create policy "Read own invoices or admin" on invoices for select to authenticated using (
  exists (select 1 from "user" u where u.id = auth.uid() and u.is_admin = true)
  or exists (select 1 from booking b where b.id = invoices.booking_id and b.user_id = auth.uid())
);

create policy "Read own invoice items or admin" on invoice_line_items for select to authenticated using (
  exists (select 1 from invoices i where i.id = invoice_line_items.invoice_id)
);

create policy "Read own payments or admin" on payment_transactions for select to authenticated using (
  exists (select 1 from "user" u where u.id = auth.uid() and u.is_admin = true)
  or exists (select 1 from booking b where b.id = payment_transactions.booking_id and b.user_id = auth.uid())
);

create policy "Read own project documents or admin" on project_documents for select to authenticated using (
  exists (select 1 from "user" u where u.id = auth.uid() and u.is_admin = true)
  or exists (select 1 from booking b where b.id = project_documents.booking_id and b.user_id = auth.uid())
);

-- Internal books: admin only
create policy "Admins read expenses" on expenses for select to authenticated using (
  exists (select 1 from "user" u where u.id = auth.uid() and u.is_admin = true)
);

create policy "Admins read tax records" on tax_records for select to authenticated using (
  exists (select 1 from "user" u where u.id = auth.uid() and u.is_admin = true)
);

create policy "Admins read inventory" on inventory_items for select to authenticated using (
  exists (select 1 from "user" u where u.id = auth.uid() and u.is_admin = true)
);

create policy "Admins read inventory transactions" on inventory_transactions for select to authenticated using (
  exists (select 1 from "user" u where u.id = auth.uid() and u.is_admin = true)
);

commit;
