import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  type: z.enum(["fallen_tree", "waterlogging", "power_outage", "other"]),
  description: z.string().min(3).max(500),
  lat: z.number(),
  lon: z.number(),
  locationLabel: z.string().optional(),
  imageDataUrl: z.string().optional(), // small demo image, base64 data URL from the browser
});

// GET: every signed-in user can see the incident feed/map (it's community
// safety information — waterlogging, outages, hazards are inherently public
// once reported). Only the Admin dashboard can bulk-notify.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const incidents = await (prisma as any).incident.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ incidents });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid report" }, { status: 400 });
  }

  // Demo-scale guard: keep inline image attachments small since they're
  // stored as a data URL in Postgres, not object storage.
  if (parsed.data.imageDataUrl && parsed.data.imageDataUrl.length > 1_500_000) {
    return NextResponse.json({ error: "Image is too large for this demo (max ~1MB)." }, { status: 413 });
  }

  const incident = await (prisma as any).incident.create({
    data: { ...parsed.data, userId },
  });

  return NextResponse.json({ incident }, { status: 201 });
}
