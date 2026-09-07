import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Marks the given incidents as "notified" and returns a summary of what
 * would have been sent. This is deliberately a labeled DEMO action, not a
 * real SMS/WhatsApp integration — wiring up an actual gateway (e.g. Twilio)
 * would require a paid account and API keys this environment doesn't have.
 * The incident status change itself is real and persisted.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { incidentIds } = await req.json();
  if (!Array.isArray(incidentIds) || incidentIds.length === 0) {
    return NextResponse.json({ error: "No incidents selected." }, { status: 400 });
  }

  const incidents = await prisma.incident.findMany({
    where: { id: { in: incidentIds } },
    include: { user: { select: { email: true } } },
  });

  // Demo log — in production this loop would call an SMS/WhatsApp gateway API.
  console.log(
    `[demo] Would send bulk SMS/WhatsApp warnings for ${incidents.length} incident(s):`,
    incidents.map((i: { type: string; locationLabel: string | null }) => `${i.type} @ ${i.locationLabel ?? "unknown location"}`)
  );

  await prisma.incident.updateMany({
    where: { id: { in: incidentIds } },
    data: { status: "notified", notifiedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    notifiedCount: incidents.length,
    demo: true,
    note: "This is a demo action: incident status was updated for real, but no actual SMS/WhatsApp messages were sent — that would require a configured gateway (e.g. Twilio) and API keys.",
  });
}
