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

const messageSchema = z.object({
  customerEmail: z.string().email("Invalid email"),
  channel: z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP"]),
  subject: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

type MessageFormData = z.infer<typeof messageSchema>;

export default function NewMessagePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { channel: "EMAIL" },
  });

  const channel = watch("channel");

  const onSubmit = async (data: MessageFormData) => {
    setError(null);
    try {
      const res = await fetch("/api/messaging/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to send message");
        return;
      }
      router.push("/messages");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/messages" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Send Message</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Input
            label="Customer email *"
            type="email"
            placeholder="customer@example.com"
            error={errors.customerEmail?.message}
            {...register("customerEmail")}
          />
          <Select
            label="Channel *"
            options={[
              { value: "EMAIL", label: "Email" },
              { value: "SMS", label: "SMS" },
              { value: "PUSH", label: "Push Notification" },
              { value: "WHATSAPP", label: "WhatsApp" },
            ]}
            {...register("channel")}
          />
          {channel === "EMAIL" && (
            <Input label="Subject" placeholder="Your message subject" {...register("subject")} />
          )}
          <Textarea
            label="Message *"
            placeholder="Write your message here..."
            rows={5}
            error={errors.content?.message}
            {...register("content")}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/messages">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" loading={isSubmitting}>Send Message</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
