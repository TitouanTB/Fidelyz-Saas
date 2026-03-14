import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Créer un compte - Fidelyz",
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Commencer</h1>
      <p className="text-gray-600 text-sm mb-6">
        Créez votre compte Fidelyz gratuitement
      </p>
      <Suspense fallback={<div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>}>
        <RegisterForm />
      </Suspense>
    </>
  );
}