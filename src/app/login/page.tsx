import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

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
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
