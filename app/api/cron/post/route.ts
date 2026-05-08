import { prisma } from "@/lib/prisma";
import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret:
    process.env.X_ACCESS_SECRET!,
});

export async function GET() {
  try {
    const posts =
      await prisma.post.findMany({
        where: {
          status: "scheduled",
          scheduledAt: {
            lte: new Date(),
          },
        },
      });

    for (const post of posts) {
      await client.v2.tweet(
        post.content
      );

      await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          status: "posted",
          postedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: posts.length,
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