import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accounts =
      await prisma.account.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      accounts
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "取得失敗",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const account =
      await prisma.account.create({
        data: {
          username:
            body.username,

          displayName:
            body.displayName,

          niche:
            body.niche,

          persona:
            body.persona,

          tone:
            body.tone,

            patterns: body.patterns,

          xApiKey:
            body.xApiKey,

          xApiSecret:
            body.xApiSecret,

          xAccessToken:
            body.xAccessToken,

          xAccessSecret:
            body.xAccessSecret,
        },
      });

    return NextResponse.json(
      account
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "保存失敗",
      },
      {
        status: 500,
      }
    );
  }
}