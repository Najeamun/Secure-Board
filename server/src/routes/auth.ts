import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db/pool.js";

export const authRouter = Router();

const LOCK_MS = 5 * 60 * 1000;
const loginState = new Map<string, {failures: number; lockedUntil: number}>(); 

authRouter.post("/register", async (req, res) => {
  const {email, password, name} = req.body;

  if (typeof password !== "string" || password.length < 8) {
  return res.status(400).json({ message: "비밀번호는 8자 이상이어야 합니다." });
}

  const passwordHash = await bcrypt.hash(password, 12);
  
  await pool.execute(
    `INSERT INTO users(email, password_hash, name, role) VALUES (?, ?, ?, 'USER')`,
    [email, passwordHash, name]
  );

  res.json({message: "registered"});
});

authRouter.post("/login", async (req, res) => {
  const {email, password} = req.body;
  
  const key = String(email).trim().toLowerCase();
  const s = loginState.get(key) ?? { failures: 0, lockedUntil: 0 };
  
  if (s.lockedUntil > Date.now()) {
    const sec = Math.ceil((s.lockedUntil - Date.now()) / 1000);
    const min = Math.floor(sec / 60);
    return res.status(429).json({ message: `로그인 시도가 많습니다. ${min}분 ${sec % 60}초 후 다시 시도해 주세요.`, retryAfter: sec });
  }

  const [rows]: any = await pool.execute(
    `SELECT id, email, password_hash, name, role FROM users WHERE email = ?`,
    [email]
  );
  
  const loginError = "이메일 또는 비밀번호가 올바르지 않습니다";
  const user = rows[0];

  const isMatch = user && password ? await bcrypt.compare(password, user.password_hash) : false;
  
  if (!isMatch) {
    s.failures++;
    const remaining = 5 - s.failures;

    if (s.failures >= 5) {
      s.lockedUntil = Date.now() + LOCK_MS;
      s.failures = 0;
    }
    loginState.set(key, s);
    return res.status(401).json({message: remaining > 0
      ? `${loginError} (남은 시도 ${remaining}회)`
      : `${loginError} 5분 동안 로그인이 제한됩니다.`,
      remaining
    });
  }

  loginState.delete(key);

  const userInfo = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  req.session.user = userInfo;
  res.cookie("lastLoginUser", JSON.stringify(userInfo), {httpOnly: false});
  res.json(userInfo);
});

authRouter.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({message: "not logged in"});
  }
  res.json(req.session.user);
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({message: "logout"}));
});