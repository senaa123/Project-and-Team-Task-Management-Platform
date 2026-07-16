"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, FolderKanban, User, Flame, Users, LogOut, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`w-64 h-screen bg-white border-r border-gray-100 flex flex-col py-8 px-6 fixed md:sticky top-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <Flame className="text-primary fill-primary" size={28} />
            <span className="font-bold text-xl text-gray-900 tracking-tight">CyphLab</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-4">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href; 
            return (
              <Link
                key={label}
                href={href}
                onClick={() => {
                  if (onClose) onClose();
                }}
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
    </>
  );
}