import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getMessagingStats } from "@/lib/messaging";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
    if (!member) return NextResponse.json({ error: "No organization" }, { status: 404 });

    // Parse date range from query params
    const startDateParam = request.nextUrl.searchParams.get("startDate");
    const endDateParam = request.nextUrl.searchParams.get("endDate");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const stats = await getMessagingStats(member.organizationId, startDate, endDate);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Get messaging stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
