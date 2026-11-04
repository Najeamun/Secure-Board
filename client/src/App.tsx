import { useEffect, useState } from "react";
import { api } from "./api";
import type { User } from "./types";
import PostList from "./pages/PostList";
import PostView from "./pages/PostView";
import PostForm from "./pages/PostForm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

export type Page =
  | {name: "list"}
  | {name: "detail"; id: number}
  | {name: "write"}
  | {name: "edit"; id: number}
  | {name: "login"}
  | {name: "register"}
  | {name: "admin"};

export type Go = (page: Page) => void;

export default function App() {
  const [me, setMe] = useState<User | null>(null);
  const [page, setPage] = useState<Page>({name: "list"});

  useEffect(() => {
    api<User>("/api/auth/me").then(setMe).catch(() => setMe(null));
  }, []);

  async function logout() {
    await api("/api/auth/logout", "POST");
    setMe(null);
    setPage({name: "list"});
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setPage({name: "list"})}>Secure Board</button>
        <nav>
          <button className="nav" onClick={() => setPage({name: "list"})}>게시판</button>
          <button className="nav" onClick={() => setPage({name: "write"})}>글쓰기</button>
          {me?.role === "ADMIN" && (
            <button className="nav" onClick={() => setPage({name: "admin"})}>관리자</button>
          )}
          {me ? (
            <>
              <span className="me">{me.name}님</span>
              <button className="ghost" onClick={logout}>로그아웃</button>
            </>
          ) : (
            <>
              <button className="ghost" onClick={() => setPage({name: "login"})}>로그인</button>
              <button className="primary" onClick={() => setPage({name: "register"})}>회원가입</button>
            </>
          )}
        </nav>
      </header>

      <main>
        {page.name === "list" && <PostList go={setPage} />}
        {page.name === "detail" && <PostView id={page.id} me={me} go={setPage} />}
        {page.name === "write" && <PostForm go={setPage} />}
        {page.name === "edit" && <PostForm id={page.id} go={setPage} />}
        {page.name === "login" && (
          <Login go={setPage} onLogin={user => { setMe(user); setPage({name: "list"}); }} />
        )}
        {page.name === "register" && <Register go={setPage} />}
        {page.name === "admin" && <Admin me={me} />}
      </main>
    </div>
  );
}
