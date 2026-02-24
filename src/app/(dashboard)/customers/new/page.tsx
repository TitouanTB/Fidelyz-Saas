"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const customerSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) });

  const onSubmit = async (data: CustomerFormData) => {
    setError(null);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create customer");
        return;
      }
      router.push("/customers");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customers" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Input label="Email *" type="email" placeholder="customer@example.com" error={errors.email?.message} {...register("email")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" placeholder="John" {...register("firstName")} />
            <Input label="Last name" placeholder="Doe" {...register("lastName")} />
          </div>
          <Input label="Phone" type="tel" placeholder="+33 6 12 34 56 78" {...register("phone")} />
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/customers">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" loading={isSubmitting}>Add Customer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
