import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { prisma } from "@/lib/prisma";

import { TwitterApi } from "twitter-api-v2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const posts =
      await prisma.post.findMany({
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

        const client =
          new TwitterApi({
            appKey:
              post.account.xApiKey,

            appSecret:
              post.account.xApiSecret,

            accessToken:
              post.account
                .xAccessToken,

            accessSecret:
              post.account
                .xAccessSecret,
          }).readWrite;

          const me =
  await client.v2.me();

console.log("ME");

console.log(me);

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
      } catch (error) {
        console.error(error);
      }
    }

    return res.status(200).json({
      success: true,
      count: posts.length,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}