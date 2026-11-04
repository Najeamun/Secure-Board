import { FormEvent, useEffect, useState } from "react";
import { api, downloadUrl } from "../api";
import { formatDate, formatSize } from "../format";
import type { Comment, PostDetail, User } from "../types";
import type { Go } from "../App";

export default function PostView({id, me, go}: {id: number; me: User | null; go: Go}) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setPost(await api<PostDetail>(`/api/posts/${id}`));
      setComments(await api<Comment[]>(`/api/posts/${id}/comments`));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function removePost() {
    await api(`/api/posts/${id}`, "DELETE");
    go({name: "list"});
  }

  async function addComment(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await api(`/api/posts/${id}/comments`, "POST", {content: text});
    setText("");
    load();
  }

  async function removeComment(commentId: number) {
    await api(`/api/posts/${id}/comments/${commentId}`, "DELETE");
    load();
  }

  if (error) return <section className="card"><p className="error">{error}</p></section>;
  if (!post) return <section className="card"><p className="muted">불러오는 중…</p></section>;

  const canEdit = me !== null && (me.id === post.user_id || me.role === "ADMIN");

  return (
    <article className="card">
      <button className="back" onClick={() => go({name: "list"})}>← 목록으로</button>
      <h1>{post.title}</h1>
      <p className="meta">{post.authorName} · {formatDate(post.created_at)}</p>

      <div className="content" dangerouslySetInnerHTML={{__html: post.content}} />

      {post.attachments.length > 0 && (
        <div className="files">
          <h2>첨부파일</h2>
          <ul>
            {post.attachments.map(a => (
              <li key={a.id}>
                <a href={downloadUrl(a.stored_name)} download={a.original_name}>{a.original_name}</a>
                <span className="muted"> {formatSize(a.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canEdit && (
        <div className="actions">
          <button className="ghost" onClick={() => go({name: "edit", id})}>수정</button>
          {confirming ? (
            <>
              <button className="danger" onClick={removePost}>정말 삭제</button>
              <button className="ghost" onClick={() => setConfirming(false)}>취소</button>
            </>
          ) : (
            <button className="ghost danger-text" onClick={() => setConfirming(true)}>삭제</button>
          )}
        </div>
      )}

      <section className="comments">
        <h2>댓글 {comments.length}</h2>
        <ul>
          {comments.map(c => (
            <li key={c.id}>
              <div className="comment-head">
                <b>{c.authorName}</b>
                <span className="muted">{formatDate(c.created_at)}</span>
                {me?.id === c.user_id && (
                  <button className="link danger-text" onClick={() => removeComment(c.id)}>삭제</button>
                )}
              </div>
              <p>{c.content}</p>
            </li>
          ))}
        </ul>
        <form className="comment-form" onSubmit={addComment}>
          <textarea id="comment" value={text} onChange={e => setText(e.target.value)} placeholder="댓글을 입력하세요" rows={3} />
          <button className="primary">댓글 등록</button>
        </form>
      </section>
    </article>
  );
}
