import { useEffect, useState } from "react";
import { api } from "../api";
import { formatDate } from "../format";
import type { Post } from "../types";
import type { Go } from "../App";

function highlight(text: string, keyword: string): string {
  return text.split(keyword).join(`<mark>${keyword}</mark>`);
}

export default function PostList({go}: {go: Go}) {
  const initial = new URLSearchParams(window.location.search).get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [searched, setSearched] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  async function load(keyword: string) {
    try {
      setPosts(await api<Post[]>(`/api/posts?q=${encodeURIComponent(keyword)}`));
      setSearched(keyword);
      setError("");
      const url = keyword ? `?q=${encodeURIComponent(keyword)}` : window.location.pathname;
      window.history.replaceState(null, "", url);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => { load(initial); }, []);

  return (
    <section className="card">
      <div className="list-head">
        <h1>게시판</h1>
        <form className="search" onSubmit={e => { e.preventDefault(); load(q); }}>
          <input id="search" value={q} onChange={e => setQ(e.target.value)} placeholder="제목으로 검색" />
          <button className="primary">검색</button>
        </form>
      </div>

      {searched && <p className="muted">'{searched}' 검색 결과 {posts.length}건</p>}
      {error && <p className="error">{error}</p>}

      <table className="posts">
        <thead>
          <tr><th className="num">번호</th><th>제목</th><th>작성자</th><th className="date">작성일</th></tr>
        </thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id}>
              <td className="num">{p.id}</td>
              <td>
                <button className="title-link" onClick={() => go({name: "detail", id: p.id})}>
                  {searched
                    ? <span dangerouslySetInnerHTML={{__html: highlight(p.title, searched)}} />
                    : p.title}
                </button>
              </td>
              <td>{p.authorName}</td>
              <td className="date">{formatDate(p.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {posts.length === 0 && !error && <p className="empty">게시글이 없습니다.</p>}
    </section>
  );
}
