import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";

interface InvoiceHistoryProps {
  organizationId: string;
}

export async function InvoiceHistory({ organizationId }: InvoiceHistoryProps) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { stripeCustomerId: true },
  });

  if (!org?.stripeCustomerId) {
    return null;
  }

  const { stripe } = await import("@/lib/stripe");
  
  let invoices;
  try {
    const invoicesList = await stripe.invoices.list({
      customer: org.stripeCustomerId,
      limit: 12,
      status: "paid",
    });
    invoices = invoicesList.data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return null;
  }

  if (!invoices || invoices.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText size={18} />
          Invoice History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                  <FileText size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(invoice.created * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {invoice.lines.data[0]?.description || "Subscription"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Paid
                </Badge>
                <span className="text-sm font-semibold text-gray-900">
                  €{(invoice.amount_paid / 100).toFixed(2)}
                </span>
                {invoice.hosted_invoice_url && (
                  <a
                    href={invoice.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white rounded-full transition-colors"
                    title="Download invoice"
                  >
                    <Download size={16} className="text-gray-500" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
