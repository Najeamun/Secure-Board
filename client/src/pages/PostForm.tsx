import { FormEvent, useEffect, useState } from "react";
import { api, uploadFile } from "../api";
import type { PostDetail } from "../types";
import type { Go } from "../App";

export default function PostForm({id, go}: {id?: number; go: Go}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id === undefined) return;
    api<PostDetail>(`/api/posts/${id}`)
      .then(p => { setTitle(p.title); setContent(p.content); })
      .catch(e => setError(e.message));
  }, [id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let postId = id;
      if (postId === undefined) {
        const result = await api<{id: number}>("/api/posts", "POST", {title, content});
        postId = result.id;
      } else {
        await api(`/api/posts/${postId}`, "PUT", {title, content});
      }
      if (file) await uploadFile(postId, file);
      go({name: "detail", id: postId});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card narrow">
      <h1>{id === undefined ? "글쓰기" : "글 수정"}</h1>
      <form className="form" onSubmit={submit}>
        <label htmlFor="title">제목</label>
        <input id="title" value={title} onChange={e => setTitle(e.target.value)} />

        <label htmlFor="content">내용</label>
        <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={10} />
        <p className="hint">&lt;b&gt;굵게&lt;/b&gt; 같은 HTML 태그를 쓸 수 있습니다.</p>

        <label htmlFor="file">첨부파일</label>
        <input id="file" type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />

        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button className="primary" disabled={saving}>{saving ? "저장 중…" : "저장"}</button>
          <button type="button" className="ghost" onClick={() => go(id === undefined ? {name: "list"} : {name: "detail", id})}>취소</button>
        </div>
      </form>
    </section>
  );
}
