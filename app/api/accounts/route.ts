import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const accounts = await prisma.account.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const body = await req.json();

  const account = await prisma.account.create({
    data: {
      username: body.username,
      displayName: body.displayName,
      niche: body.niche,
      persona: body.persona,
      tone: body.tone,
    },
  });

  return NextResponse.json(account);
}