"use client";

import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Hi, {user?.name ?? "there"}
        </h1>
        <p className="text-sm text-primary">Let&rsquo;s finish your tasks today!</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 bg-white shadow-card px-3 py-1.5 rounded-lg font-medium">
          {user?.role?.replace("_", " ")}
        </span>
        <button className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center hover:bg-primary-50 transition">
          <Bell size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}