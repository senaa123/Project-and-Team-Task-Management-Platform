"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, FolderKanban, User, Flame, Users, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tasks", href: "/tasks", icon: ListChecks },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    ...(user?.role === "ADMIN" ? [{ label: "Approvals", href: "/approvals", icon: Users }] : []),
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col py-8 px-6 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <Flame className="text-primary fill-primary" size={28} />
        <span className="font-bold text-xl text-gray-900 tracking-tight">CyphLab</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href; 
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center justify-between px-2 py-1 transition ${
                active ? "text-primary font-semibold" : "text-gray-400 font-medium hover:text-gray-600"
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon size={20} className={active ? "text-primary" : "text-gray-400"} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={() => {
            useAuthStore.getState().logout();
            window.location.href = "/login";
          }}
          className="flex items-center gap-4 px-2 py-1 transition w-full text-left text-gray-400 font-medium hover:text-gray-600"
        >
          <LogOut size={20} className="text-gray-400" />
          Log out
        </button>
      </div>
    </aside>
  );
}