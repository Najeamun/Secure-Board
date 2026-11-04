import { useEffect, useState } from "react";
import { api } from "../api";
import type { AdminUser, User } from "../types";

export default function Admin({me}: {me: User | null}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setUsers(await api<AdminUser[]>(`/api/admin/users?role=${me?.role ?? ""}`));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => { load(); }, [me]);

  async function changeRole(id: number, role: string) {
    await api(`/api/admin/users/${id}/role`, "POST", {role});
    load();
  }

  return (
    <section className="card">
      <h1>관리자 · 회원 관리</h1>
      {error && <p className="error">{error}</p>}
      <table className="posts">
        <thead>
          <tr><th className="num">번호</th><th>이메일</th><th>이름</th><th>권한</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="num">{u.id}</td>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>
                <select id={`role-${u.id}`} value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
