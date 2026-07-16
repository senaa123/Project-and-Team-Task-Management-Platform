"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/auth-store";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !token) {
      router.replace("/login");
    }
  }, [token, router, _hasHydrated]);

  if (!_hasHydrated || !token) return null;

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <div className="font-bold text-xl text-gray-900 tracking-tight">CyphLab</div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-gray-600">
            <Menu size={24} />
          </button>
        </header>
        
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}