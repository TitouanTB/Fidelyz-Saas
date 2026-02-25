import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Plan } from "@prisma/client";

interface SubscriptionStatusProps {
  plan: Plan;
  hasActiveSubscription: boolean;
  stripeCurrentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
}

export function SubscriptionStatus({
  plan,
  hasActiveSubscription,
  stripeCurrentPeriodEnd,
  stripeCustomerId,
}: SubscriptionStatusProps) {
  if (!hasActiveSubscription) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle size={20} className="text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-800">No active subscription</p>
          <p className="text-xs text-amber-600">
            You are currently on the free plan. Upgrade to unlock more features.
          </p>
        </div>
      </div>
    );
  }

  const isExpiringSoon = stripeCurrentPeriodEnd && 
    new Date(stripeCurrentPeriodEnd).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
      <CheckCircle size={20} className="text-green-600" />
      <div>
        <p className="text-sm font-medium text-green-800">Active subscription</p>
        <p className="text-xs text-green-600">
          Current plan: <span className="font-semibold">{plan}</span>
          {stripeCurrentPeriodEnd && (
            <> · {isExpiringSoon ? "Renews soon" : "Renews"} {new Date(stripeCurrentPeriodEnd).toLocaleDateString()}</>
          )}
        </p>
      </div>
      {isExpiringSoon && (
        <div className="ml-auto flex items-center gap-1 text-xs text-amber-600">
          <Clock size={14} />
          <span>Expiring soon</span>
        </div>
      )}
    </div>
  );
}
