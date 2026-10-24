# Admin User Guide

How to run the Sauvage Outdoors website as its administrator. Each section says what
works today and what is not finished yet, so you know what to rely on.

## Getting in

1. Go to `/login` and sign in with your admin email and password.
2. Go to `/admin`. (After login the site sends you to the home page, not the dashboard.)
3. Forgot your password? Use `/forgot-password`.

The left sidebar holds every admin section, in this order: Overview, Bookings,
Customers, Services, Media, Projects, Calendar, Financials, Team, Quotes, Inventory,
Reports, Settings.

## How work flows through the site

1. A customer fills out the **quote request** on the Contact page (with optional photos).
2. It shows up in **Quotes** as `pending`.
3. You review it, adjust prices, and **Convert to Booking**.
4. The booking appears in **Bookings**, where you assign an employee.
5. When the job is done, mark the booking **Completed** and **Create Invoice**.
6. Record the payment in **Financials → Payments** or mark the invoice paid.

## Overview

A snapshot of the business: total revenue, bookings, pending quotes, recent activity,
and upcoming tasks.

- Works: the Overview tab cards and recent activity.
- Not finished: "Active Projects" and "completed" counts read 0. The **Communications**
  and **Workflow** tabs are sample screens with fake names and buttons that do nothing.

## Bookings

Every job, newest first.

- Filter by status (Pending, Confirmed, Assigned, In Progress, Completed, Cancelled) or search by name, email, or service.
- **Export CSV** downloads the list.
- **Confirm** a pending booking in one click.
- **View** opens the booking. You can edit service, date, status, payment status, amounts (due, paid, estimated, cost, deposit), details, and notes, then **Save Changes**.
- **Assign Employee** picks a team member and puts the job on the calendar. The booking needs a preferred date first.
- **Create Invoice** appears once a booking is Completed. It needs a service cost or estimated value. Tax is fixed at 8%.

## Customers

A searchable, read-only list of everyone with an account, with **Export CSV** and a
detail view. You cannot add, edit, or remove customers here yet.

## Services

The services shown on the public quote form.

- **New Service / Edit**: name, base price, categories, description.
- Add a new category while editing a service.
- Not finished: no delete, no service photos.

**The current services, prices, and categories are placeholders.** Replace them with
your real ones here.

## Media

The photo and video gallery shown on the public site.

- **Upload** one or more photos or videos (iPhone HEIC photos convert automatically), choose a category and optional title.
- **Feature** an item to highlight it.
- **Edit** title, category, project type, location, completion date, description, and before/after pairing.
- **Delete** removes the file and the gallery entry.

**The current gallery is placeholder imagery.** Upload your real project photos here.

## Projects

Every booking viewed as a project, with team, checklist, notes, communications, and
phases. This section is **view only**; there is no way to add phases, notes, or
checklist items from the site yet.

## Calendar

Shows employee availability (green/red), assigned jobs (blue), and unassigned
bookings with a date (amber). Click an event for details.

- Not finished: the filters and drag-to-reschedule do not work yet. Reschedule by editing the booking instead.

## Financials

Four tabs.

- **Overview**: revenue, expenses, net profit, outstanding invoices, recent transactions.
- **Invoices**: list, search, and filter invoices. **Mark Paid** records a payment. The **New Invoice** button in this tab lets you pick a booking and add line items.
  - **Send** marks an invoice "sent" but **does not email it**. Email is not set up.
- **Expenses**: **Add Expense** (description, amount, category, date, vendor, payment method, reimbursable, notes), then Approve, Reject, or Mark Reimbursed.
- **Payments**: **Record Payment** (booking, invoice, amount, method, date, reference), then Mark Completed, Mark Failed, or Refund.
  - Recording a payment here does not update the invoice or the booking's amount paid.
  - Refund only changes the status. **No card payments are processed**; Stripe is not connected.

The "Generate Report" and header "New Invoice" buttons do nothing yet.

## Team

Your employees.

- **Add New Member**: first name, last name, email, phone, position, hire date, address, active, and "Grant admin privileges."
- After saving, the site shows a **temporary password** once. Copy it and give it to the employee; no email is sent.
- **Edit Profile** updates details or turns a member inactive.

**Important:** every team member added here can open the full admin dashboard,
whether or not "Grant admin privileges" is checked.

## Quotes

- List with search and status filter, and a Quote → Booking → Invoice progress strip.
- **New Quote**: customer name, email, phone, address (or search an existing customer), service type, description, line items, internal notes. Saves as a draft.
- Open a quote to **Edit Quote** (items and notes), **Send to Customer**, **Reject**, or **Convert to Booking**.
  - Send to Customer marks it "sent" but **does not email it**.
  - Editing a quote resets it to draft.
  - A quote the customer approves from their portal shows as `approved`, and there is no button to convert it yet.
  - Photos attached by the customer may not display.

## Inventory

A read-only view of stock: total items, total value, low stock, search, and sort.
"Add Item" and clicking an item lead to pages that do not exist yet, so stock cannot
be added from the site.

## Reports

A placeholder. Creating, running, and scheduling reports is not built.

## Settings

A placeholder. The business info, hours, rates, team roles, and email settings shown
here are sample values and **nothing on this page saves**.

## What your customers and employees see

- **Customers** (`/customer`): their quotes and projects, matched by email. They can approve or decline a pending quote. Messages are "coming soon"; invoices and online payment are not available.
- **Employees** (`/employee`): today's assigned jobs, clock in/out, and job notes and photos. Job photos and notes do not save yet.
