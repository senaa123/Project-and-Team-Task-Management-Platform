"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import Button from "@/components/ui/Button";
import { ListChecks, FolderKanban, Users, Flame } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await api.post("/auth/login", data);
      setAuth(res.data.accessToken, res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex w-1/2 bg-primary text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Flame className="text-white fill-white" size={20} />
          </div>
          <span className="font-semibold text-lg">CyphLab</span>
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-semibold mb-3">Organize work. Ship faster.</h2>
          <p className="text-primary-100/80 text-sm mb-8">
            Plan projects, assign tasks, and keep your whole team aligned from one workspace.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <FolderKanban size={18} />
              </div>
              Project tracking
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <ListChecks size={18} />
              </div>
              Task management
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Users size={18} />
              </div>
              Team collaboration
            </div>
          </div>
        </div>

        <p className="text-xs text-primary-100/60 relative z-10">
          &copy; {new Date().getFullYear()} CyphLab
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Log in to continue to CyphLab</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("email")}
                placeholder="Email"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-primary font-medium">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}