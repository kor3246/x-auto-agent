"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] =
    useState(false);

  const [accounts, setAccounts] =
    useState<any[]>([]);

  const [posts, setPosts] = useState<any[]>(
    []
  );

  const [ideas, setIdeas] =
    useState<any[]>([]);

  const [ideaInput, setIdeaInput] =
    useState("");

  const [selectedAccountId, setSelectedAccountId] =
    useState("");

  const [generatedPost, setGeneratedPost] =
    useState("");

  const [latestPostId, setLatestPostId] =
    useState("");

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [editingPostId, setEditingPostId] =
    useState("");

  const [editingContent, setEditingContent] =
    useState("");

 const [form, setForm] = useState({
  username: "",
  displayName: "",
  niche: "",
  persona: "",
  tone: "",
  patterns: "",

  xApiKey: "",
  xApiSecret: "",

  xAccessToken: "",
  xAccessSecret: "",
});

  useEffect(() => {
    loadAccounts();
    loadPosts();
    loadIdeas();
  }, []);

  async function loadAccounts() {
  const res = await fetch(
    "/api/accounts"
  );

  const data = await res.json();

  setAccounts(data);

  if (
    data.length > 0 &&
    !selectedAccountId
  ) {
    setSelectedAccountId(
      data[0].id
    );
  }
}

  async function loadPosts() {
    const res = await fetch("/api/posts");

    const data = await res.json();

    setPosts(data);
  }

  async function loadIdeas() {
  try {
    const res = await fetch("/api/ideas");

    if (!res.ok) {
      console.error(
        "ideas api error",
        res.status
      );
      return;
    }

    const text = await res.text();

    if (!text) {
      setIdeas([]);
      return;
    }

    const data = JSON.parse(text);

    setIdeas(data);
  } catch (error) {
    console.error(error);
    setIdeas([]);
  }
}

  async function createAccount() {
    setLoading(true);

    await fetch("/api/accounts", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(form),
    });

  setForm({
  username: "",
  displayName: "",
  niche: "",
  persona: "",
  tone: "",
  patterns: "",

  xApiKey: "",
  xApiSecret: "",

  xAccessToken: "",
  xAccessSecret: "",
});
    await loadAccounts();

    setLoading(false);

    alert("保存完了");
  }

  async function generatePost() {
    if (!selectedAccountId) {
      alert(
        "アカウントを選択してください"
      );
      return;
    }

    setLoading(true);

    const res = await fetch(
      "/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          accountId: selectedAccountId,
        }),
      }
    );

    const data = await res.json();

    setGeneratedPost(data.content);

    setLatestPostId(data.id);

    await loadPosts();

    setLoading(false);
  }

  async function publishPost() {
    if (!latestPostId) {
      alert(
        "先に投稿生成してください"
      );
      return;
    }

    setLoading(true);

    const res = await fetch("/api/post", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        postId: latestPostId,
      }),
    });

    const data = await res.json();

    await loadPosts();

    setLoading(false);

    if (data.success) {
      alert("Xへ投稿しました");
    } else {
      alert(
        data.error || "投稿失敗"
      );
    }
  }

  async function schedulePost() {
    if (!latestPostId) {
      alert(
        "先に投稿生成してください"
      );
      return;
    }

    if (!scheduledAt) {
      alert(
        "日時を選択してください"
      );
      return;
    }

    setLoading(true);

    const res = await fetch(
      "/api/schedule",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          postId: latestPostId,
          scheduledAt,
        }),
      }
    );

    const data = await res.json();

    setLoading(false);

    if (data.success) {
      alert("予約完了");
    } else {
      alert(
        data.error || "予約失敗"
      );
    }
  }

  async function bulkGeneratePosts() {
    if (!selectedAccountId) {
      alert(
        "アカウントを選択してください"
      );
      return;
    }

    setLoading(true);

    try {
      let currentDate =
        new Date(Date.now() + 3600000);

      for (let i = 0; i < 10; i++) {
        const generateRes =
          await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              accountId:
                selectedAccountId,
            }),
          });

        const generated =
          await generateRes.json();

        const randomMinutes =
          Math.floor(
            Math.random() * 135
          ) + 45;

        const nextTime =
          currentDate.getTime() +
          randomMinutes * 60000;

        currentDate = new Date(nextTime);

        if (
          currentDate.getHours() < 7
        ) {
          currentDate.setHours(
            7,
            0,
            0,
            0
          );
        }

        if (
          currentDate.getHours() >=
          23
        ) {
          currentDate.setDate(
            currentDate.getDate() + 1
          );

          currentDate.setHours(
            7,
            0,
            0,
            0
          );
        }

        await fetch("/api/schedule", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            postId: generated.id,
            scheduledAt:
              currentDate.toISOString(),
          }),
        });
      }

      await loadPosts();

      alert(
        "10投稿を自動予約しました"
      );
    } catch (error) {
      console.error(error);

      alert("失敗しました");
    }

    setLoading(false);
  }

  async function cancelSchedule(
    postId: string
  ) {
    const ok = confirm(
      "予約を解除しますか？"
    );

    if (!ok) return;

    await fetch(
      "/api/cancel-schedule",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          postId,
        }),
      }
    );

    await loadPosts();

    alert("予約解除しました");
  }

  async function savePostEdit() {
    if (!editingPostId) return;

    setLoading(true);

    await fetch(
      `/api/posts/${editingPostId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          content: editingContent,
        }),
      }
    );

    setEditingPostId("");
    setEditingContent("");

    await loadPosts();

    setLoading(false);

    alert("保存しました");
  }

  async function saveIdea() {
    if (!ideaInput) return;

    await fetch("/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        content: ideaInput,
      }),
    });

    setIdeaInput("");

    await loadIdeas();

    alert("ネタ保存");
  }

  async function deleteAccount(id: string) {
    const ok = confirm(
      "本当に削除しますか？"
    );

    if (!ok) return;

    await fetch(`/api/accounts/${id}`, {
      method: "DELETE",
    });

    await loadAccounts();

    alert("削除しました");
  }

  return (
    <main className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 bg-slate-950 text-white p-6">
        <h1 className="text-3xl font-black mb-10">
          X Auto Agent
        </h1>

        <div className="space-y-3">
          <div className="bg-slate-800 p-4 rounded-xl">
            アカウント数:
            {accounts.length}
          </div>

          <div className="bg-slate-800 p-4 rounded-xl">
            総投稿数:
            {posts.length}
          </div>

          <div className="bg-orange-500 p-4 rounded-xl font-bold">
            予約投稿:
            {
              posts.filter(
                (p) =>
                  p.status ===
                  "scheduled"
              ).length
            }
          </div>

          <div className="bg-green-600 p-4 rounded-xl font-bold">
            投稿済み:
            {
              posts.filter(
                (p) =>
                  p.status ===
                  "posted"
              ).length
            }
          </div>

          <div className="bg-slate-700 p-4 rounded-xl font-bold">
            下書き:
            {
              posts.filter(
                (p) =>
                  p.status ===
                  "draft"
              ).length
            }
          </div>
        </div>
      </aside>

      <div className="flex-1 p-10">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border">
            <h2 className="text-3xl font-black text-black mb-8">
              アカウント登録
            </h2>

            <div className="space-y-6">
              <input
                className="w-full border rounded-xl p-4 text-black"
                placeholder="Xユーザー名"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username:
                      e.target.value,
                  })
                }
              />

              <input
                className="w-full border rounded-xl p-4 text-black"
                placeholder="表示名"
                value={form.displayName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    displayName:
                      e.target.value,
                  })
                }
              />

              <input
                className="w-full border rounded-xl p-4 text-black"
                placeholder="ジャンル"
                value={form.niche}
                onChange={(e) =>
                  setForm({
                    ...form,
                    niche:
                      e.target.value,
                  })
                }
              />

              <textarea
                className="w-full border rounded-xl p-4 text-black min-h-[120px]"
                placeholder="ペルソナ"
                value={form.persona}
                onChange={(e) =>
                  setForm({
                    ...form,
                    persona:
                      e.target.value,
                  })
                }
              />

              <textarea
  className="w-full border rounded-xl p-4 text-black min-h-[120px]"
  placeholder="文体"
  value={form.tone}
  onChange={(e) =>
    setForm({
      ...form,
      tone: e.target.value,
    })
  }
/>

<textarea
  className="w-full border rounded-xl p-4 text-black min-h-[120px]"
  placeholder="投稿パターン（カンマ区切り）"
  value={form.patterns}
  onChange={(e) =>
    setForm({
      ...form,
      patterns: e.target.value,
    })
  }
/>

<input
  className="w-full border rounded-xl p-4 text-black"
  placeholder="X API Key"
  value={form.xApiKey}
  onChange={(e) =>
    setForm({
      ...form,
      xApiKey: e.target.value,
    })
  }
/>

<input
  className="w-full border rounded-xl p-4 text-black"
  placeholder="X API Secret"
  value={form.xApiSecret}
  onChange={(e) =>
    setForm({
      ...form,
      xApiSecret: e.target.value,
    })
  }
/>

<input
  className="w-full border rounded-xl p-4 text-black"
  placeholder="X Access Token"
  value={form.xAccessToken}
  onChange={(e) =>
    setForm({
      ...form,
      xAccessToken: e.target.value,
    })
  }
/>


<input
  className="w-full border rounded-xl p-4 text-black"
  placeholder="X Access Secret"
  value={form.xAccessSecret}
  onChange={(e) =>
    setForm({
      ...form,
      xAccessSecret: e.target.value,
    })
  }
/>

              <button
                onClick={createAccount}
                disabled={loading}
                className="w-full bg-black text-white p-4 rounded-xl font-bold"
              >
                アカウント保存
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border">
            <h2 className="text-3xl font-black text-black mb-8">
              AI投稿生成
            </h2>

            <div className="mb-8 border rounded-2xl p-5 bg-slate-50">
              <h3 className="text-xl font-black mb-4 text-black">
                ネタストック
              </h3>

              <div className="flex gap-2 mb-4">
                <input
                  value={ideaInput}
                  onChange={(e) =>
                    setIdeaInput(
                      e.target.value
                    )
                  }
                  placeholder="投稿ネタを入力"
                  className="flex-1 border rounded-xl p-3 text-black"
                />

                <button
                  onClick={saveIdea}
                  className="bg-black text-white px-5 rounded-xl font-bold"
                >
                  保存
                </button>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
               {ideas.map((idea) => (
  <div
    key={idea.id}
    className="bg-white border rounded-xl p-3 text-sm text-black"
  >
                    {idea.content}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {accounts.map((account) => (
                <div
                  key={account.id}
                 onClick={() => {
  setSelectedAccountId(
    account.id
  );

  setLatestPostId("");
  setGeneratedPost("");
}}
                  className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer ${
                    selectedAccountId ===
                    account.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  <div>
                    <div className="font-bold text-black">
                      @{account.username}
                    </div>

                    <div className="text-sm text-slate-500">
                      {account.niche}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAccount(
                        account.id
                      );
                    }}
                    className="text-red-500 font-bold"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) =>
                  setScheduledAt(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-4 text-black"
              />

              <button
                onClick={generatePost}
                disabled={loading}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold"
              >
                AI投稿生成
              </button>

              <button
                onClick={publishPost}
                disabled={loading}
                className="w-full bg-green-600 text-white p-4 rounded-xl font-bold"
              >
                Xへ投稿
              </button>

              <button
                onClick={schedulePost}
                disabled={loading}
                className="w-full bg-orange-500 text-white p-4 rounded-xl font-bold"
              >
                予約投稿
              </button>

              <button
                onClick={bulkGeneratePosts}
                disabled={loading}
                className="w-full bg-purple-600 text-white p-4 rounded-xl font-bold"
              >
                10投稿生成予約
              </button>
            </div>

            {generatedPost && (
              <div className="mt-8 border rounded-xl p-5 bg-slate-50 whitespace-pre-wrap text-black">
                {generatedPost}
              </div>
            )}

            <div className="mt-10">
              <h2 className="text-2xl font-black text-black mb-6">
                投稿履歴
              </h2>

              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-black">
                          @{post.account?.username}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          作成:
                          {new Date(
                            post.createdAt
                          ).toLocaleString()}
                        </div>

                        {post.scheduledAt && (
                          <div className="text-xs text-orange-500 mt-1 font-bold">
                            予約:
                            {new Date(
                              post.scheduledAt
                            ).toLocaleString()}
                          </div>
                        )}

                        {post.postedAt && (
                          <div className="text-xs text-green-600 mt-1 font-bold">
                            投稿:
                            {new Date(
                              post.postedAt
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div>
                        {post.status ===
                          "posted" && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            投稿済み
                          </span>
                        )}

                        {post.status ===
                          "scheduled" && (
                          <div className="flex flex-col items-end gap-2">
                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                              予約済み
                            </span>

                            <button
                              onClick={() =>
                                cancelSchedule(
                                  post.id
                                )
                              }
                              className="text-xs text-red-500 font-bold"
                            >
                              予約解除
                            </button>
                          </div>
                        )}

                        {post.status ===
                          "draft" && (
                          <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                            下書き
                          </span>
                        )}
                      </div>
                    </div>

                    {editingPostId ===
                    post.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={
                            editingContent
                          }
                          onChange={(e) =>
                            setEditingContent(
                              e.target.value
                            )
                          }
                          className="w-full border rounded-xl p-4 text-black min-h-[150px]"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={
                              savePostEdit
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                          >
                            保存
                          </button>

                          <button
                            onClick={() => {
                              setEditingPostId(
                                ""
                              );

                              setEditingContent(
                                ""
                              );
                            }}
                            className="bg-slate-300 px-4 py-2 rounded-xl text-sm font-bold"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="whitespace-pre-wrap text-black leading-7">
                          {post.content}
                        </div>

                        <button
                          onClick={() => {
                            setEditingPostId(
                              post.id
                            );

                            setEditingContent(
                              post.content
                            );
                          }}
                          className="text-sm text-blue-600 font-bold"
                        >
                          編集
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}