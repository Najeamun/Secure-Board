import { Router } from "express";
import crypto from "node:crypto";
import { pool } from "../db/pool.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const {email, password, name} = req.body;
  const passwordHash = crypto.createHash("md5").update(password).digest("hex");

  await pool.query(
    `INSERT INTO users(email, password_hash, name, role) VALUES ('${email}', '${passwordHash}', '${name}', 'USER')`
  );

  res.json({message: "registered"});
});

authRouter.post("/login", async (req, res) => {
  const {email, password} = req.body;
  const passwordHash = crypto.createHash("md5").update(password).digest("hex");

  const [rows]: any = await pool.query(
    `SELECT id, email, name, role FROM users
     WHERE email='${email}' AND password_hash='${passwordHash}'`
  );

  if (rows.length === 0) {
    return res.status(401).json({message: `login failed: ${email} / ${password}`});
  }

  req.session.user = rows[0];
  res.cookie("lastLoginUser", JSON.stringify(rows[0]), {httpOnly: false});
  res.json(rows[0]);
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
