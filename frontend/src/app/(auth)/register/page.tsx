"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import { CheckCircle, ListChecks, FolderKanban, Users, Flame } from "lucide-react";

const schema = z
  .object({
    empId: z
      .string()
      .trim()
      .min(1, "Employee ID is required")
      .regex(/^\S+$/, "Employee ID cannot contain spaces"),
    name: z.string().trim().min(2, "Name is too short"),
    email: z.string().trim().email("Invalid email"),
    password: z
      .string()
      .min(6, "Minimum 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function BrandPanel() {
  return (
    <div className="hidden lg:flex w-1/2 bg-primary text-white flex-col justify-between p-12 relative overflow-hidden">
      <div className="flex items-center gap-2.5 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
          <Flame className="text-white fill-white" size={20} />
        </div>
        <span className="font-semibold text-lg">CyphLab</span>
      </div>

      <div className="relative z-10 max-w-sm">
        <h2 className="text-3xl font-semibold mb-3">Join your team&rsquo;s workspace.</h2>
        <p className="text-primary-100/80 text-sm mb-8">
          Create an account to start tracking projects and tasks with CyphLab.
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
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await api.post("/auth/register", data);
      setIsSuccess(true);
      setSuccessMessage(res.data.message ?? "Registration successful.");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Registration failed");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex bg-background">
        <BrandPanel />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Account Created!</h1>
            <p className="text-sm text-gray-500 mb-8 px-4">
              {successMessage || "Please wait for an administrator to verify your account and assign your role."}
            </p>

            <Button onClick={() => router.push("/login")} className="w-full">
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <BrandPanel />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create an account</h1>
          <p className="text-sm text-gray-500 mb-6">Join CyphLab to manage your projects</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("empId")}
                placeholder="Employee ID"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              {errors.empId && <p className="text-xs text-red-500 mt-1">{errors.empId.message}</p>}
            </div>

            <div>
              <input
                {...register("name")}
                placeholder="Full name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

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

            <div>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-primary font-medium">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}