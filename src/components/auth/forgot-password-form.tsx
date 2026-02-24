"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <Alert variant="success">
        <AlertDescription className="flex items-start gap-2">
          <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Email envoyé !</p>
            <p className="text-sm mt-1">
              Un lien de réinitialisation a été envoyé à votre adresse email. 
              Cliquez sur le lien pour définir un nouveau mot de passe.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p>Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="vous@entreprise.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Mail className="h-4 w-4 mr-2" />
        )}
        Envoyer le lien
      </Button>
      <p className="text-center text-sm text-gray-600">
        Vous souvenez-vous de votre mot de passe ?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}