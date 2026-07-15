"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex w-full h-full bg-white text-gray-800 p-4 md:p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Profile</h1>
        
        <div className="bg-[#E4DCFB] rounded-[24px] p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left mb-8 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="mt-2 sm:mt-0">
            <h2 className="font-bold text-gray-900 text-2xl mb-1">{user?.name ?? "Guest User"}</h2>
            <p className="text-primary font-bold">{user?.role?.replace("_", " ") ?? "Unknown Role"}</p>
            <p className="text-gray-500 font-medium text-sm mt-2">{user?.email ?? "No email provided"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
        >
          <LogOut size={20} className="text-gray-500" />
          Log out
        </button>
      </div>
    </div>
  );
}
