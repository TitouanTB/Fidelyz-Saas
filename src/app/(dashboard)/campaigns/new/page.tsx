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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const campaignSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["ONE_TIME", "AUTOMATED", "RECURRING"]),
  channels: z.array(z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP"])).min(1, "Select at least one channel"),
  subject: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  scheduledAt: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const CHANNEL_OPTIONS = ["EMAIL", "SMS", "PUSH", "WHATSAPP"] as const;

export default function NewCampaignPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["EMAIL"]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { type: "ONE_TIME", channels: ["EMAIL"] },
  });

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const onSubmit = async (data: CampaignFormData) => {
    setError(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, channels: selectedChannels }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create campaign");
        return;
      }
      router.push("/campaigns");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/campaigns" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Campaign</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Input label="Campaign name *" placeholder="Summer Loyalty Boost" error={errors.name?.message} {...register("name")} />
          <Input label="Description" placeholder="Brief description of this campaign" {...register("description")} />
          <Select
            label="Campaign type *"
            options={[
              { value: "ONE_TIME", label: "One-time" },
              { value: "AUTOMATED", label: "Automated" },
              { value: "RECURRING", label: "Recurring" },
            ]}
            {...register("type")}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Channels *</label>
            <div className="flex gap-2 flex-wrap">
              {CHANNEL_OPTIONS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    selectedChannels.includes(ch)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
            {errors.channels && <p className="text-xs text-red-500">{errors.channels.message}</p>}
          </div>
          {selectedChannels.includes("EMAIL") && (
            <Input label="Email subject" placeholder="Exclusive offer just for you!" {...register("subject")} />
          )}
          <Textarea
            label="Message content *"
            placeholder="Enter your message content..."
            rows={6}
            error={errors.content?.message}
            {...register("content")}
          />
          <Input label="Schedule for (optional)" type="datetime-local" {...register("scheduledAt")} />
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/campaigns">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" loading={isSubmitting}>Create Campaign</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
