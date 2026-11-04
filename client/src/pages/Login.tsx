import { FormEvent, useState } from "react";
import { api } from "../api";
import type { User } from "../types";
import type { Go } from "../App";

export default function Login({go, onLogin}: {go: Go; onLogin: (user: User) => void}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      onLogin(await api<User>("/api/auth/login", "POST", {email, password}));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="card narrow">
      <h1>로그인</h1>
      <form className="form" onSubmit={submit}>
        <label htmlFor="email">이메일</label>
        <input id="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />

        <label htmlFor="password">비밀번호</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />

        {error && <p className="error">{error}</p>}
        <button className="primary wide">로그인</button>
      </form>
      <p className="hint">수업용 기본 계정: student1@school.test / student1234</p>
      <p className="muted">계정이 없나요? <button className="link" onClick={() => go({name: "register"})}>회원가입</button></p>
    </section>
  );
}
