import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicPageHeader } from "@/components/home/PublicPageHeader";

export const metadata: Metadata = {
  title: "Masuk",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-[#fffdf9]">
      <PublicPageHeader />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
