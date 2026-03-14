"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error" | "pending";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const email = searchParams.get("email");

  const verifyEmail = useCallback(async () => {
    const supabase = createClient();
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as "signup" | "email_change" | "recovery",
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("success");
        setMessage("Votre email a été vérifié avec succès !");
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } else {
      setStatus("pending");
    }
  }, [searchParams, router]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendSuccess(false);
    
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (!error) {
      setResendSuccess(true);
    }
    setIsResending(false);
  };

  return (
    <div className="space-y-4">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Vérification de votre email...</p>
        </div>
      )}

      {status === "success" && (
        <Alert variant="success">
          <AlertDescription className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Email vérifié !</p>
              <p className="text-sm mt-1">{message}</p>
              <p className="text-sm mt-1">Redirection vers le tableau de bord...</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <>
          <Alert variant="destructive">
            <AlertDescription className="flex items-start gap-2">
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Erreur de vérification</p>
                <p className="text-sm mt-1">{message}</p>
              </div>
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </>
      )}

      {status === "pending" && (
        <>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Vérifiez votre email
            </h2>
            <p className="text-gray-600 text-sm">
              Un lien de vérification a été envoyé à{" "}
              {email ? (
                <span className="font-medium text-gray-900">{email}</span>
              ) : (
                "votre adresse email"
              )}
              . Cliquez sur le lien pour activer votre compte.
            </p>
          </div>

          {resendSuccess && (
            <Alert variant="success">
              <AlertDescription>
                Un nouvel email de vérification a été envoyé.
              </AlertDescription>
            </Alert>
          )}

          {email && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Renvoyer l&apos;email
            </Button>
          )}

          <p className="text-center text-sm text-gray-600">
            Déjà vérifié ?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}