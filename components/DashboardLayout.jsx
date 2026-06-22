"use client";

import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, user, role = "user" }) {
  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
