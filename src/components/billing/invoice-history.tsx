import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import Stripe from "stripe";

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

  const { listInvoices } = await import("@/lib/stripe");
  
  let invoices;
  try {
    const invoicesList = await listInvoices(org.stripeCustomerId, 12);
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">Date</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: any, index: number) => (
                <tr key={invoice.id || index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-medium">
                    {invoice.created ? new Date(invoice.created * 1000).toLocaleDateString() : ""}
                  </td>
                  <td className="p-4 align-middle">
                    {invoice.amount_due ? `$${(invoice.amount_due / 100).toFixed(2)}` : ""}
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    {invoice.hosted_invoice_url ? (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
