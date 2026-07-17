import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-[#fffdf9]">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
