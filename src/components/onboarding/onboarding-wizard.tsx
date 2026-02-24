"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateSlug } from "@/lib/utils";
import { Sparkles, Building2, Palette, CheckCircle } from "lucide-react";

const onboardingSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const INDUSTRIES = [
  { value: "", label: "Select your industry" },
  { value: "retail", label: "Retail" },
  { value: "restaurant", label: "Restaurant & Food" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "fitness", label: "Fitness & Sports" },
  { value: "hospitality", label: "Hospitality" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

const STEPS = [
  { id: 1, label: "Organization", icon: Building2 },
  { id: 2, label: "Branding", icon: Palette },
  { id: 3, label: "AI Setup", icon: Sparkles },
  { id: 4, label: "Complete", icon: CheckCircle },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { primaryColor: "#6366f1" },
  });

  const orgName = watch("organizationName");
  const industry = watch("industry");

  const generateAiDescription = async () => {
    if (!orgName || !industry) return;
    setLoadingAi(true);
    try {
      const res = await fetch("/api/onboarding/ai-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName: orgName, industry }),
      });
      const data = await res.json();
      if (data.description) {
        setAiSuggestion(data.description);
        setValue("description", data.description);
      }
    } catch {
      setAiSuggestion(null);
    } finally {
      setLoadingAi(false);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          slug: generateSlug(data.organizationName),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create organization");
        return;
      }
      setStep(4);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.id ? "text-indigo-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > s.id ? "bg-indigo-600 text-white" : step === s.id ? "border-2 border-indigo-600 text-indigo-600" : "border-2 border-gray-200 text-gray-400"}`}>
                {step > s.id ? <CheckCircle size={16} /> : s.id}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 sm:w-16 mx-2 ${step > s.id ? "bg-indigo-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6 space-y-4 min-h-64">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Tell us about your organization</h2>
              <Input
                label="Organization name"
                placeholder="Acme Corp"
                error={errors.organizationName?.message}
                {...register("organizationName")}
              />
              <Select
                label="Industry"
                options={INDUSTRIES}
                error={errors.industry?.message}
                {...register("industry")}
              />
              <Input
                label="Website URL (optional)"
                type="url"
                placeholder="https://yourcompany.com"
                error={errors.websiteUrl?.message}
                {...register("websiteUrl")}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Customize your branding</h2>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Brand color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="h-10 w-20 rounded-lg border border-gray-300 cursor-pointer"
                    {...register("primaryColor")}
                  />
                  <Input
                    placeholder="#6366f1"
                    className="flex-1"
                    {...register("primaryColor")}
                  />
                </div>
                {errors.primaryColor && <p className="text-xs text-red-500">{errors.primaryColor.message}</p>}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-10 rounded-lg border-2 border-transparent hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => setValue("primaryColor", color)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">AI-powered description</h2>
              <p className="text-sm text-gray-500">Our AI can generate a compelling description for your loyalty page.</p>
              <Button
                type="button"
                variant="outline"
                onClick={generateAiDescription}
                loading={loadingAi}
                className="w-full"
              >
                <Sparkles size={16} />
                Generate with AI
              </Button>
              {aiSuggestion && (
                <Alert variant="success">
                  <AlertDescription>AI suggestion applied! You can edit it below.</AlertDescription>
                </Alert>
              )}
              <Textarea
                label="Description (optional)"
                placeholder="Describe your loyalty program and what makes it special..."
                rows={4}
                {...register("description")}
              />
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">You&apos;re all set!</h2>
              <p className="text-gray-500 mt-2">Redirecting you to your dashboard...</p>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            ) : (
              <Button type="submit" loading={isSubmitting}>
                Complete Setup
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
