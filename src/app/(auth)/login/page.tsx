import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion - Fidelyz",
};

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenue</h1>
      <p className="text-gray-600 text-sm mb-6">
        Connectez-vous à votre compte Fidelyz
      </p>
      <LoginForm />
    </>
  );
}