import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgId = member.organizationId;
    const searchParams = request.nextUrl.searchParams;
    const format_type = searchParams.get("format") || "csv";

    // Fetch all data for export
    const [customers, messages, campaigns, visits, pointsTransactions, rewardClaims] = await Promise.all([
      prisma.customer.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          points: true,
          tier: true,
          totalSpend: true,
          visitCount: true,
          createdAt: true,
          lastVisitAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          channel: true,
          status: true,
          sentAt: true,
          deliveredAt: true,
          openedAt: true,
          clickedAt: true,
          customer: { select: { email: true } },
          campaign: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      prisma.campaign.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          totalSent: true,
          totalDelivered: true,
          totalOpened: true,
          totalClicked: true,
          createdAt: true,
          sentAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.visit.findMany({
        where: {},
        select: {
          id: true,
          amount: true,
          pointsEarned: true,
          createdAt: true,
          customer: { select: { email: true, organizationId: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      prisma.pointsTransaction.findMany({
        where: {},
        select: {
          id: true,
          points: true,
          type: true,
          source: true,
          description: true,
          createdAt: true,
          customer: { select: { email: true, organizationId: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      prisma.rewardClaim.findMany({
        where: { reward: { organizationId: orgId } },
        select: {
          id: true,
          status: true,
          code: true,
          claimedAt: true,
          redeemedAt: true,
          customer: { select: { email: true } },
          reward: { select: { name: true, pointsRequired: true } },
        },
        orderBy: { claimedAt: "desc" },
        take: 500,
      }),
    ]);

    // Filter visits and points for this organization
    const orgVisits = visits.filter((v) => v.customer?.organizationId === orgId);
    const orgPointsTransactions = pointsTransactions.filter((p) => p.customer?.organizationId === orgId);

    // Calculate summary stats
    const totalCustomers = customers.length;
    const totalMessages = messages.length;
    const totalCampaigns = campaigns.length;
    const totalRevenue = orgVisits.reduce((sum, v) => sum + (v.amount || 0), 0);
    const totalPointsEarned = orgPointsTransactions.filter((p) => p.type === "EARN").reduce((sum, p) => sum + p.points, 0);
    const totalPointsRedeemed = orgPointsTransactions.filter((p) => p.type === "REDEEM").reduce((sum, p) => sum + p.points, 0);
    const deliveredMessages = messages.filter((m) => ["DELIVERED", "OPENED", "CLICKED"].includes(m.status)).length;
    const openedMessages = messages.filter((m) => ["OPENED", "CLICKED"].includes(m.status)).length;
    const deliveryRate = totalMessages > 0 ? ((deliveredMessages / totalMessages) * 100).toFixed(1) : "0";
    const openRate = deliveredMessages > 0 ? ((openedMessages / deliveredMessages) * 100).toFixed(1) : "0";

    if (format_type === "csv") {
      return generateCSVExport({
        customers,
        messages,
        campaigns,
        visits: orgVisits,
        pointsTransactions: orgPointsTransactions,
        rewardClaims,
        summary: {
          organization: member.organization.name,
          generatedAt: new Date().toISOString(),
          period: "All time",
          totalCustomers,
          totalMessages,
          totalCampaigns,
          totalRevenue,
          totalPointsEarned,
          totalPointsRedeemed,
          deliveryRate,
          openRate,
        },
      });
    } else if (format_type === "pdf") {
      return generatePDFExport({
        customers,
        messages,
        campaigns,
        visits: orgVisits,
        pointsTransactions: orgPointsTransactions,
        rewardClaims,
        summary: {
          organization: member.organization.name,
          generatedAt: new Date().toISOString(),
          period: "All time",
          totalCustomers,
          totalMessages,
          totalCampaigns,
          totalRevenue,
          totalPointsEarned,
          totalPointsRedeemed,
          deliveryRate,
          openRate,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateCSVExport(data: {
  customers: any[];
  messages: any[];
  campaigns: any[];
  visits: any[];
  pointsTransactions: any[];
  rewardClaims: any[];
  summary: any;
}) {
  const csvParts: string[] = [];

  // Summary section
  csvParts.push("ANALYTICS REPORT");
  csvParts.push(`Organization,${data.summary.organization}`);
  csvParts.push(`Generated At,${format(new Date(data.summary.generatedAt), "yyyy-MM-dd HH:mm:ss")}`);
  csvParts.push("");
  csvParts.push("SUMMARY");
  csvParts.push(`Total Customers,${data.summary.totalCustomers}`);
  csvParts.push(`Total Messages,${data.summary.totalMessages}`);
  csvParts.push(`Total Campaigns,${data.summary.totalCampaigns}`);
  csvParts.push(`Total Revenue,${data.summary.totalRevenue.toFixed(2)}`);
  csvParts.push(`Total Points Earned,${data.summary.totalPointsEarned}`);
  csvParts.push(`Total Points Redeemed,${data.summary.totalPointsRedeemed}`);
  csvParts.push(`Delivery Rate,${data.summary.deliveryRate}%`);
  csvParts.push(`Open Rate,${data.summary.openRate}%`);
  csvParts.push("");

  // Customers section
  csvParts.push("CUSTOMERS");
  csvParts.push("Email,First Name,Last Name,Points,Tier,Total Spend,Visit Count,Created At,Last Visit");
  data.customers.forEach((c) => {
    csvParts.push(
      [
        c.email,
        c.firstName || "",
        c.lastName || "",
        c.points,
        c.tier || "No Tier",
        c.totalSpend.toFixed(2),
        c.visitCount,
        format(new Date(c.createdAt), "yyyy-MM-dd"),
        c.lastVisitAt ? format(new Date(c.lastVisitAt), "yyyy-MM-dd") : "",
      ].join(",")
    );
  });
  csvParts.push("");

  // Campaigns section
  csvParts.push("CAMPAIGNS");
  csvParts.push("Name,Type,Status,Sent,Delivered,Opened,Clicked,Created At");
  data.campaigns.forEach((c) => {
    csvParts.push(
      [
        `"${c.name}"`,
        c.type,
        c.status,
        c.totalSent,
        c.totalDelivered,
        c.totalOpened,
        c.totalClicked,
        format(new Date(c.createdAt), "yyyy-MM-dd"),
      ].join(",")
    );
  });
  csvParts.push("");

  // Messages section
  csvParts.push("MESSAGES (Last 1000)");
  csvParts.push("Customer Email,Channel,Status,Campaign,Sent At,Delivered At,Opened At");
  data.messages.forEach((m) => {
    csvParts.push(
      [
        m.customer?.email || "",
        m.channel,
        m.status,
        m.campaign?.name || "",
        m.sentAt ? format(new Date(m.sentAt), "yyyy-MM-dd HH:mm") : "",
        m.deliveredAt ? format(new Date(m.deliveredAt), "yyyy-MM-dd HH:mm") : "",
        m.openedAt ? format(new Date(m.openedAt), "yyyy-MM-dd HH:mm") : "",
      ].join(",")
    );
  });
  csvParts.push("");

  // Visits section
  csvParts.push("VISITS (Last 1000)");
  csvParts.push("Customer Email,Amount,Points Earned,Date");
  data.visits.forEach((v) => {
    csvParts.push(
      [
        v.customer?.email || "",
        v.amount.toFixed(2),
        v.pointsEarned,
        format(new Date(v.createdAt), "yyyy-MM-dd HH:mm"),
      ].join(",")
    );
  });
  csvParts.push("");

  // Points transactions section
  csvParts.push("POINTS TRANSACTIONS (Last 1000)");
  csvParts.push("Customer Email,Points,Type,Source,Description,Date");
  data.pointsTransactions.forEach((p) => {
    csvParts.push(
      [
        p.customer?.email || "",
        p.points,
        p.type,
        p.source || "",
        p.description || "",
        format(new Date(p.createdAt), "yyyy-MM-dd HH:mm"),
      ].join(",")
    );
  });
  csvParts.push("");

  // Reward claims section
  csvParts.push("REWARD CLAIMS (Last 500)");
  csvParts.push("Customer Email,Reward,Points Required,Status,Code,Claimed At,Redeemed At");
  data.rewardClaims.forEach((r) => {
    csvParts.push(
      [
        r.customer?.email || "",
        `"${r.reward?.name || ""}"`,
        r.reward?.pointsRequired || 0,
        r.status,
        r.code || "",
        format(new Date(r.claimedAt), "yyyy-MM-dd HH:mm"),
        r.redeemedAt ? format(new Date(r.redeemedAt), "yyyy-MM-dd HH:mm") : "",
      ].join(",")
    );
  });

  const csvContent = csvParts.join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fidelyz-analytics-${format(new Date(), "yyyy-MM-dd")}.csv"`,
    },
  });
}

function generatePDFExport(data: {
  customers: any[];
  messages: any[];
  campaigns: any[];
  visits: any[];
  pointsTransactions: any[];
  rewardClaims: any[];
  summary: any;
}) {
  // Generate HTML for PDF export (browser can print to PDF)
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fidelyz Analytics Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #9317FD; padding-bottom: 20px; }
    .header h1 { font-size: 32px; color: #9317FD; margin-bottom: 10px; }
    .header p { color: #666; font-size: 14px; }
    .section { margin-bottom: 40px; }
    .section-title { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e5e5e5; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .kpi-card { background: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #9317FD; }
    .kpi-label { font-size: 12px; color: #666; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
    th { background: #f8f9fa; font-weight: 600; color: #333; }
    tr:hover { background: #fafafa; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 12px; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .kpi-card { break-inside: avoid; }
      table { break-inside: auto; }
      tr { break-inside: avoid; break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Fidelyz Analytics Report</h1>
      <p>Organization: ${data.summary.organization}</p>
      <p>Generated: ${format(new Date(data.summary.generatedAt), "MMMM dd, yyyy 'at' HH:mm")}</p>
    </div>

    <div class="section">
      <h2 class="section-title">Key Performance Indicators</h2>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${data.summary.totalCustomers.toLocaleString()}</div>
          <div class="kpi-label">Total Customers</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${data.summary.totalMessages.toLocaleString()}</div>
          <div class="kpi-label">Messages Sent</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${data.summary.openRate}%</div>
          <div class="kpi-label">Open Rate</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">€${data.summary.totalRevenue.toLocaleString()}</div>
          <div class="kpi-label">Total Revenue</div>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${data.summary.totalCampaigns}</div>
          <div class="kpi-label">Campaigns</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${data.summary.deliveryRate}%</div>
          <div class="kpi-label">Delivery Rate</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${data.summary.totalPointsEarned.toLocaleString()}</div>
          <div class="kpi-label">Points Earned</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${data.summary.totalPointsRedeemed.toLocaleString()}</div>
          <div class="kpi-label">Points Redeemed</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Recent Campaigns</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Sent</th>
            <th>Opened</th>
            <th>Click Rate</th>
          </tr>
        </thead>
        <tbody>
          ${data.campaigns.slice(0, 10).map((c) => {
            const clickRate = c.totalSent > 0 ? ((c.totalClicked / c.totalSent) * 100).toFixed(1) : "0";
            const statusClass = c.status === "COMPLETED" ? "badge-success" : c.status === "ACTIVE" ? "badge-info" : "badge-warning";
            return `
              <tr>
                <td>${c.name}</td>
                <td><span class="badge ${statusClass}">${c.status}</span></td>
                <td>${c.totalSent}</td>
                <td>${c.totalOpened}</td>
                <td>${clickRate}%</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Top Customers</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Points</th>
            <th>Tier</th>
            <th>Total Spend</th>
            <th>Visits</th>
          </tr>
        </thead>
        <tbody>
          ${data.customers.slice(0, 20).map((c) => `
            <tr>
              <td>${c.email}</td>
              <td>${c.points}</td>
              <td>${c.tier || "No Tier"}</td>
              <td>€${c.totalSpend.toFixed(2)}</td>
              <td>${c.visitCount}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Recent Reward Claims</h2>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Reward</th>
            <th>Points</th>
            <th>Status</th>
            <th>Claimed</th>
          </tr>
        </thead>
        <tbody>
          ${data.rewardClaims.slice(0, 10).map((r) => {
            const statusClass = r.status === "REDEEMED" ? "badge-success" : r.status === "PENDING" ? "badge-warning" : "badge-info";
            return `
              <tr>
                <td>${r.customer?.email || "N/A"}</td>
                <td>${r.reward?.name || "N/A"}</td>
                <td>${r.reward?.pointsRequired || 0}</td>
                <td><span class="badge ${statusClass}">${r.status}</span></td>
                <td>${format(new Date(r.claimedAt), "MMM dd, yyyy")}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Generated by Fidelyz - Customer Loyalty Platform</p>
      <p>This report contains confidential business data.</p>
    </div>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="fidelyz-analytics-${format(new Date(), "yyyy-MM-dd")}.html"`,
    },
  });
}
