import { prisma } from "@/lib/prisma";
import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: {
  status: "scheduled",
  scheduledAt: {
    lte: new Date(),
  },
},
      include: {
        account: true,
      },
    });

    for (const post of posts) {
      try {
        if (
          !post.account.xApiKey ||
          !post.account.xApiSecret ||
          !post.account.xAccessToken ||
          !post.account.xAccessSecret
        ) {
          
          continue;
        }

        const client = new TwitterApi({
          appKey: post.account.xApiKey,
          appSecret: post.account.xApiSecret,
          accessToken: post.account.xAccessToken,
          accessSecret: post.account.xAccessSecret,
        }).readWrite;

        await client.v2.tweet(post.content);

        await prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            status: "posted",
            postedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("予約投稿失敗:", post.id, error);
      }
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