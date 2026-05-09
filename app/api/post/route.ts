import { prisma } from "@/lib/prisma";
import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const post =
      await prisma.post.findUnique({
        where: {
          id: body.postId,
        },
        include: {
          account: true,
        },
      });

    if (!post) {
      return NextResponse.json(
        {
          error: "Post not found",
        },
        {
          status: 404,
        }
      );
    }

    console.log(post.account);

    if (
      !post.account.xApiKey ||
      !post.account.xApiSecret ||
      !post.account.xAccessToken ||
      !post.account.xAccessSecret
    ) {
      return NextResponse.json(
        {
          error: "X認証情報未設定",
        },
        {
          status: 400,
        }
      );
    }

    const client = new TwitterApi({
      appKey:
        post.account.xApiKey,

      appSecret:
        post.account.xApiSecret,

      accessToken:
        post.account.xAccessToken,

      accessSecret:
        post.account.xAccessSecret,
    }).readWrite;

    const me =
      await client.v2.me();

    console.log(me);

    await client.v2.tweet(
      post.content
    );

    const updated =
      await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          status: "posted",
          postedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      post: updated,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "投稿失敗",
      },
      {
        status: 500,
      }
    );
  }
}