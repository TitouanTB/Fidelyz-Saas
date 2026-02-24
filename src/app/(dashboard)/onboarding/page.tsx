import { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = { title: "Setup your loyalty program - Fidelyz" };

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Fidelyz!</h1>
          <p className="text-gray-500 mt-2">Let&apos;s create your loyalty program with AI assistance</p>
        </div>
        <OnboardingWizard />
        <p className="text-center text-sm text-gray-400 mt-6">
          Powered by Gemini Flash 2.0 AI
        </p>
      </div>
    </div>
  );
}
