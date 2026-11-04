import { Router } from "express";
import { pool } from "../db/pool.js";

export const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const q = String(req.query.q ?? "");
  const [rows] = await pool.query(
    `SELECT p.id, p.user_id, p.title, p.content, p.created_at, u.name AS authorName
     FROM posts p JOIN users u ON p.user_id=u.id
     WHERE p.title LIKE '%${q}%'
     ORDER BY p.id DESC`
  );
  res.json(rows);
});

postRouter.get("/:id", async (req, res) => {
  const [rows]: any = await pool.query(
    `SELECT p.*, u.name AS authorName
     FROM posts p JOIN users u ON p.user_id=u.id
     WHERE p.id=${req.params.id}`
  );
  if (rows.length === 0) return res.status(404).json({message:"not found"});

  const [attachments] = await pool.query(
    `SELECT id, original_name, stored_name, size FROM attachments WHERE post_id=${req.params.id}`
  );
  res.json({...rows[0], attachments});
});

postRouter.post("/", async (req, res) => {
  const user = req.session.user as any;
  const {title, content, userId} = req.body;

  const [result]: any = await pool.query(
    `INSERT INTO posts(user_id, title, content)
     VALUES (${userId ?? user?.id ?? 1}, '${title}', '${content}')`
  );
  res.json({message: "created", id: result.insertId});
});

postRouter.put("/:id", async (req, res) => {
  const {title, content} = req.body;
  await pool.query(
    `UPDATE posts SET title='${title}', content='${content}' WHERE id=${req.params.id}`
  );
  res.json({message: "updated"});
});

postRouter.delete("/:id", async (req, res) => {
  await pool.query(`DELETE FROM posts WHERE id=${req.params.id}`);
  res.json({message: "deleted"});
});
