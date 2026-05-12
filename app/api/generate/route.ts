import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


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

    const postPatterns =
  account.patterns
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

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
      take: 20,
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
      `投稿タイプは ${pattern} の雰囲気`,
`書き出しは ${hook} を意識`,
`締めは ${cta} を意識`,
      `参考ネタ: ${randomIdea}`,
      "",
      "過去投稿:",
      oldPostsText,
      "",
     "条件:",
"- 過去投稿と似せない",
"- 毎回まったく別人が書いたようにする",
"- 同じ書き出し禁止",
"- 同じテンポ禁止",
"- 同じ改行位置禁止",
"- 毎回感情温度を変える",
"- 毎回キャラを変える",
"- 綺麗にまとめすぎない",
"- 説教っぽくしない",
"- 人間の失敗感を入れる",
"- 生々しさを入れる",
"- AI感を消す",
"- Twitter廃人っぽさを入れる",
"- 独り言っぽい投稿も混ぜる",
"- 毒舌も混ぜる",
"- 短文投稿も混ぜる",
"- 1〜4行程度でまとめる",
"- 無駄に長くしない",
"- ダラダラ書かない",
"- 一文を短くする",
"- 140文字以内厳守",
"- 読みやすさ優先",
"- オチ無し投稿も混ぜる",
"- 感情が動く内容",
"- 共感されやすく",
"- 保存されやすく",
"- 140文字以内",
"- 改行あり",
"",
"ハッシュタグ条件:",
"- ハッシュタグは毎回変える",
"- 無難タグ禁止",
"- #副業 #恋愛 #人生 など単語タグ禁止",
"- 感情・状況・あるある系タグを優先",
"- Xで実際に使われてそうなタグ",
"- タグ無し投稿も30%混ぜる",
"- ハッシュタグは最大2個",
"",
"タイムリー要素:",
"- 月曜日",
"- 深夜テンション",
"- 仕事終わり",
"- 給料日前",
"- 雨の日",
"- 休日終わり",
"- 季節感",
"- SNS疲れ",
"- 平日朝",
"- タイムリー要素は毎回入れない",
"- 【】などのラベルを書かない",
"- フックなどの説明文を書かない",
"- 投稿本文だけ出力する",
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
    temperature: 1.1,
top_p: 0.9,
presence_penalty: 0.7,
frequency_penalty: 0.7,
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