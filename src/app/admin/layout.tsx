"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../components/admin/ThemeToggle";
import { FaTachometerAlt, FaCalendarAlt, FaUsers, FaCogs, FaImages, FaProjectDiagram, FaDollarSign, FaClipboardList, FaBoxes, FaChartBar, FaWrench, FaQuoteRight } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const nav = [
  { href: "/admin", label: "Overview", icon: <FaTachometerAlt /> },
  { href: "/admin/bookings", label: "Bookings", icon: <FaClipboardList /> },
  { href: "/admin/customers", label: "Customers", icon: <FaUsers /> },
  { href: "/admin/services", label: "Services", icon: <FaWrench /> },
  { href: "/admin/media", label: "Media", icon: <FaImages /> },
  { href: "/admin/projects", label: "Projects", icon: <FaProjectDiagram /> },
  { href: "/admin/calendar", label: "Calendar", icon: <FaCalendarAlt /> },
  { href: "/admin/financials", label: "Financials", icon: <FaDollarSign /> },
  { href: "/admin/team", label: "Team", icon: <FaCogs /> },
  { href: "/admin/quotes", label: "Quotes", icon: <FaQuoteRight /> },
  { href: "/admin/inventory", label: "Inventory", icon: <FaBoxes /> },
  { href: "/admin/reports", label: "Reports", icon: <FaChartBar /> },
  { href: "/admin/settings", label: "Settings", icon: <FaCogs /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);
  const { signOut, profile } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin_assist', 'Employee']}>
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className={`transition-all duration-200 ${open ? "w-64" : "w-16"} bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800`}> 
        <div className="flex items-center justify-between px-3 h-14 border-b border-gray-200 dark:border-gray-800">
          <Link href="/admin" className="font-semibold">Admin</Link>
          <button onClick={() => setOpen((o) => !o)} className="text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">{open ? "⟨⟨" : "⟩⟩"}</button>
        </div>
        <nav className="p-2 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${active ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""}`}>
                <span className="text-base">{item.icon}</span>
                <span className={open ? "block" : "hidden"}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur flex items-center justify-between px-4">
          <div className="font-semibold">Dashboard</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Notifications</button>
            <button onClick={async () => { await signOut(); window.location.assign("/"); }} className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Logout</button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 grid gap-4">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}


