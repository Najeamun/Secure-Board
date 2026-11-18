import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

export const adminRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.session.user as any;
  if (!user) return res.status(401).json({ message: "로그인이 필요합니다." });
  if (user.role !== "ADMIN") return res.status(403).json({ message: "admin only" });
  next();
}

adminRouter.use(requireAdmin);

adminRouter.get("/users", async (req, res) => {
  const [rows] = await pool.query("SELECT id,email,name,role,password_hash FROM users");
  res.json(rows);
});

adminRouter.post("/users/:id/role", async (req, res) => {
  const {role} = req.body;
  await pool.execute(`UPDATE users SET role = ? WHERE id = ?`, [role, req.params.id]);
  res.json({message:"role changed"});
});
