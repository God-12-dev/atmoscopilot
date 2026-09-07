import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      tempUnit: true,
      windUnit: true,
      weatherAlerts: true,
      dailyForecast: true,
      language: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const allowed = ["name", "tempUnit", "windUnit", "weatherAlerts", "dailyForecast", "language"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const user = await (prisma as any).user.update({
    where: { id: userId },
    data,
    select: { name: true, email: true, tempUnit: true, windUnit: true, weatherAlerts: true, dailyForecast: true, language: true },
  });

  return NextResponse.json({ user });
}
