import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const conversations = await (prisma as any).conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      location: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({ conversations });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });

  const convo = await (prisma as any).conversation.findFirst({ where: { id, userId } });
  if (!convo) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  await (prisma as any).conversation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
