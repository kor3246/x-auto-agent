import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const postPatterns = [
  "共感ポスト",
  "辛口ポスト",
  "恋愛あるある",
  "人生の気づき",
  "自己肯定感",
  "心理学雑学",
  "ストーリー体験談",
  "短文エモ系",
  "問題提起",
  "朝投稿",
  "夜投稿",
  "救われる言葉",
  "本音暴露",
  "男性心理",
  "女性心理",
  "恋愛テクニック",
  "依存恋愛",
  "失恋系",
  "片思い系",
  "人間関係",
];

const hooks = [
  "強い一言から始める",
  "悩みを代弁する",
  "意外性から始める",
  "共感重視",
  "本音っぽく書く",
];

const ctas = [
  "最後に問いかけ",
  "共感を促す",
  "保存したくなる締め",
  "感情を揺らす締め",
];

function randomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const account = await prisma.account.findUnique({
      where: {
        id: body.accountId,
      },
    });

    if (!account) {
      return NextResponse.json(
        {
          error: "Account not found",
        },
        {
          status: 404,
        }
      );
    }

   const prismaAny = prisma as any;

const ideas: any[] =
  await prismaAny.idea.findMany();

    const randomIdea =
  ideas.length > 0
    ? randomItem(
        ideas.map(
          (idea: any) =>
            idea.content
        )
      )
    : "AIが自由に考えてください";

    const oldPosts = await prisma.post.findMany({
      where: {
        accountId: account.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const oldPostsText = oldPosts
      .map((post) => post.content)
      .join("\n\n");

    const pattern = randomItem(postPatterns);
    const hook = randomItem(hooks);
    const cta = randomItem(ctas);

    const prompt = [
      "あなたはプロのXマーケターです。",
      "",
      "以下条件で、毎回違う雰囲気のX投稿を1つ作成してください。",
      "",
      `ジャンル: ${account.niche}`,
      `ペルソナ: ${account.persona}`,
      `文体: ${account.tone}`,
      `投稿タイプ: ${pattern}`,
      `フック: ${hook}`,
      `締め: ${cta}`,
      `参考ネタ: ${randomIdea}`,
      "",
      "過去投稿:",
      oldPostsText,
      "",
      "条件:",
      "- 過去投稿と似せない",
      "- 毎回違う切り口",
      "- 同じ書き出し禁止",
      "- ワンパターン禁止",
      "- 投稿タイプに合わせる",
      "- AI感を消す",
      "- 人間っぽくする",
      "- 感情が動く内容",
      "- 共感されやすく",
      "- 保存されやすく",
      "- 140文字以内",
      "- 改行あり",
      "- エンゲージ重視",
      "- 最後に自然なハッシュタグ2〜3個",
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 1.4,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content =
      completion.choices[0].message.content || "";

    const post = await prisma.post.create({
      data: {
        accountId: account.id,
        content,
        status: "draft",
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error?.message || "生成失敗",
      },
      {
        status: 500,
      }
    );
  }
}