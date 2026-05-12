import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("SCHEDULE START");

    const body = await req.json();

    console.log(body);

    const updated =
      await prisma.post.update({
        where: {
          id: body.postId,
        },
        data: {
          scheduledAt: new Date(
            new Date(
              body.scheduledAt
            ).getTime() -
              9 *
                60 *
                60 *
                1000
          ),
          status: "scheduled",
        },
      });

    console.log(updated);

    return NextResponse.json({
      success: true,
    });
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