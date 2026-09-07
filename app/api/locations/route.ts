import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const locations = await (prisma as any).favoriteLocation.findMany({
    where: { userId },
    include: { location: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ locations });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { name, state, country, lat, lon } = await req.json();
  if (typeof lat !== "number" || typeof lon !== "number" || !name) {
    return NextResponse.json({ error: "Invalid location" }, { status: 400 });
  }

  // Locations are identified by lat/lon (unique constraint) to avoid
  // duplicate rows for the same place under slightly different names.
  const location = await (prisma as any).location.upsert({
    where: { lat_lon: { lat, lon } },
    update: {},
    create: { name, state, country, lat, lon },
  });

  const saved = await (prisma as any).favoriteLocation.upsert({
    where: { userId_locationId: { userId, locationId: location.id } },
    update: {},
    create: { userId, locationId: location.id },
    include: { location: true },
  });

  return NextResponse.json({ location: saved }, { status: 201 });
}

// PATCH { locationId, isDefault: true } — mark one saved location as the user's default.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { locationId, isDefault } = await req.json();
  if (!locationId) return NextResponse.json({ error: "Missing locationId" }, { status: 400 });

  if (isDefault) {
    // Only one default at a time per user.
    await (prisma as any).favoriteLocation.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  await (prisma as any).favoriteLocation.updateMany({
    where: { userId, locationId },
    data: { isDefault: Boolean(isDefault) },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { locationId } = await req.json();
  if (!locationId) return NextResponse.json({ error: "Missing locationId" }, { status: 400 });

  await (prisma as any).favoriteLocation.deleteMany({ where: { userId, locationId } });
  return NextResponse.json({ success: true });
}
