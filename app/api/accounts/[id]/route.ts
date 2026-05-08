import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    // 投稿削除
    await prisma.post.deleteMany({
      where: {
        accountId: id,
      },
    });

    // アカウント削除
    await prisma.account.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "削除失敗",
      },
      {
        status: 500,
      }
    );
  }
}