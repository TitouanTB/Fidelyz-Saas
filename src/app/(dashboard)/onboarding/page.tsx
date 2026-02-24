import { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = { title: "Setup your organization - Fidelyz" };

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Fidelyz!</h1>
        <p className="text-gray-500 mt-2">Let&apos;s set up your loyalty program in a few steps</p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
