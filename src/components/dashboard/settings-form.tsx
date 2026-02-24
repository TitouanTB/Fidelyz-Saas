"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Organization } from "@prisma/client";

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  organization: Organization;
}

export function SettingsForm({ organization }: SettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description || "",
      websiteUrl: organization.websiteUrl || "",
      primaryColor: organization.primaryColor,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to save settings");
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert variant="success"><AlertDescription>Settings saved successfully!</AlertDescription></Alert>}
        <Input label="Organization name *" error={errors.name?.message} {...register("name")} />
        <Textarea label="Description" rows={3} {...register("description")} />
        <Input label="Website URL" type="url" placeholder="https://yourcompany.com" error={errors.websiteUrl?.message} {...register("websiteUrl")} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Brand color</label>
          <div className="flex items-center gap-3">
            <input type="color" className="h-10 w-20 rounded-lg border border-gray-300 cursor-pointer" {...register("primaryColor")} />
            <Input placeholder="#6366f1" className="flex-1" {...register("primaryColor")} />
          </div>
        </div>
        <div className="pt-2">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
