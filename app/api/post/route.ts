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

export async function POST(req: Request) {
  try {
    console.log("POST START");

    const body = await req.json();

    console.log(body);

    const post = await prisma.post.findUnique({
      where: {
        id: body.postId,
      },
    });

    console.log(post);

    if (!post) {
      return NextResponse.json(
        {
          error: "post not found",
        },
        {
          status: 404,
        }
      );
    }

    // X投稿
    const tweet =
      await client.v2.tweet(post.content);

    console.log(tweet);

    // 投稿済み更新
    await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        status: "posted",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error?.data?.detail ||
          error?.message ||
          JSON.stringify(error),
      },
      {
        status: 500,
      }
    );
  }
}