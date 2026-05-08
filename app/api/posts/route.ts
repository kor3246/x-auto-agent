import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const posts =
      await prisma.post.findMany({
        include: {
          account: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "posts fetch failed",
      },
      {
        status: 500,
      }
    );
  }
}