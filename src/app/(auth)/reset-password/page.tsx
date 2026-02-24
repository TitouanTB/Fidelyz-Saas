import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe - Fidelyz",
};

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouveau mot de passe</h1>
      <p className="text-gray-600 text-sm mb-6">
        Définissez votre nouveau mot de passe.
      </p>
      <ResetPasswordForm />
    </>
  );
}