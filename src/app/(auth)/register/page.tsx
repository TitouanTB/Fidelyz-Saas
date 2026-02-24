import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account - Fidelyz",
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Get started</h1>
      <p className="text-gray-600 text-sm mb-6">Create your Fidelyz account for free</p>
      <RegisterForm />
    </>
  );
}
