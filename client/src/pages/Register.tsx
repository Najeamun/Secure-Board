import { FormEvent, useState } from "react";
import { api } from "../api";
import type { Go } from "../App";

export default function Register({go}: {go: Go}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/auth/register", "POST", {email, name, password});
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (done) {
    return (
      <section className="card narrow">
        <h1>가입 완료</h1>
        <p>이제 로그인할 수 있습니다.</p>
        <button className="primary wide" onClick={() => go({name: "login"})}>로그인하러 가기</button>
      </section>
    );
  }

  return (
    <section className="card narrow">
      <h1>회원가입</h1>
      <form className="form" onSubmit={submit}>
        <label htmlFor="reg-email">이메일</label>
        <input id="reg-email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />

        <label htmlFor="reg-name">이름</label>
        <input id="reg-name" value={name} onChange={e => setName(e.target.value)} />

        <label htmlFor="reg-password">비밀번호</label>
        <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />

        {error && <p className="error">{error}</p>}
        <button className="primary wide">가입하기</button>
      </form>
    </section>
  );
}
