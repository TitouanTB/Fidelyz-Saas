import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié - Fidelyz",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié</h1>
      <p className="text-gray-600 text-sm mb-6">
        Pas de souci, nous vous enverrons un lien de réinitialisation.
      </p>
      <ForgotPasswordForm />
    </>
  );
}