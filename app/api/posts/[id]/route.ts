import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const body = await req.json();

    const params =
      await context.params;

    const post =
      await prisma.post.update({
        where: {
          id: params.id,
        },
        data: {
          content: body.content,
        },
      });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}