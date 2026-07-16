import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CyphLab - Project & Task Management",
  description: "Manage projects and tasks across your team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background font-sans">{children}</body>
    </html>
  );
}