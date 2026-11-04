import { Router } from "express";
import { pool } from "../db/pool.js";

export const adminRouter = Router();

adminRouter.get("/users", async (req, res) => {
  const role = String(req.query.role ?? "");
  if (role === "ADMIN") {
    const [rows] = await pool.query("SELECT id,email,name,role,password_hash FROM users");
    return res.json(rows);
  }
  res.status(403).json({message:"admin only"});
});

adminRouter.post("/users/:id/role", async (req, res) => {
  const {role} = req.body;
  await pool.query(`UPDATE users SET role='${role}' WHERE id=${req.params.id}`);
  res.json({message:"role changed"});
});
