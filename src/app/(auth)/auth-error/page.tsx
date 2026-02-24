"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, RefreshCw } from "lucide-react";

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    auth_callback_error: "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
    invalid_token: "Le lien de connexion n'est plus valide ou a expiré.",
    expired_token: "Le lien de connexion a expiré. Veuillez en demander un nouveau.",
    access_denied: "L'accès a été refusé. Veuillez réessayer.",
    no_session: "Aucune session active trouvée.",
    default: "Une erreur d'authentification s'est produite. Veuillez réessayer.",
  };

  const errorMessage = errorMessages[error || "default"] || errorMessages.default;

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
      </div>

      <Alert variant="destructive">
        <AlertDescription>
          <p className="font-medium">Erreur de connexion</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
        <Button variant="outline" className="w-full" onClick={() => router.refresh()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir la page
        </Button>
      </div>

      <p className="text-center text-sm text-gray-600">
        Le problème persiste ?{" "}
        <a href="mailto:support@fidelyz.com" className="text-indigo-600 font-medium hover:underline">
          Contactez le support
        </a>
      </p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}