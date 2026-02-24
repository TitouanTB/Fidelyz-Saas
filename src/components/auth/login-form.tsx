"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

type AuthMode = "password" | "magic-link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("password");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
  });

  const handlePasswordLogin = async (data: LoginFormData) => {
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Email ou mot de passe incorrect"
        : authError.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  };

  const handleMagicLink = async (data: MagicLinkFormData) => {
    setError(null);
    setSuccess(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    setSuccess("Un lien de connexion a été envoyé à votre adresse email. Cliquez sur le lien pour vous connecter.");
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
    if (authError) {
      setError(authError.message);
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <Alert variant="success" className="mb-4">
        <AlertDescription className="flex items-start gap-2">
          <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continuer avec Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      {/* Auth Mode Toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => setAuthMode("password")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            authMode === "password"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Mot de passe
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("magic-link")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            authMode === "magic-link"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Lien magique
        </button>
      </div>

      {/* Password Form */}
      {authMode === "password" && (
        <form onSubmit={loginForm.handleSubmit(handlePasswordLogin)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="vous@entreprise.com"
            error={loginForm.formState.errors.email?.message}
            {...loginForm.register("email")}
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            error={loginForm.formState.errors.password?.message}
            {...loginForm.register("password")}
          />
          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loginForm.formState.isSubmitting}
          >
            {loginForm.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Se connecter
          </Button>
        </form>
      )}

      {/* Magic Link Form */}
      {authMode === "magic-link" && (
        <form onSubmit={magicLinkForm.handleSubmit(handleMagicLink)} className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p>Entrez votre email et nous vous enverrons un lien de connexion sécurisé.</p>
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="vous@entreprise.com"
            error={magicLinkForm.formState.errors.email?.message}
            {...magicLinkForm.register("email")}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={magicLinkForm.formState.isSubmitting}
          >
            {magicLinkForm.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Envoyer le lien
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-indigo-600 font-medium hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}