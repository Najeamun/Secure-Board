import { Router } from "express";
import { pool } from "../db/pool.js";
import type { Request, Response, NextFunction } from "express"

export const postRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  next();
}

// 게시글 검색
postRouter.get("/", async (req, res) => {
  const raw = req.query.q;

  if (raw !== undefined && typeof raw !== "string") {
    return res.status(400).json({ message: "q must be a string" });
  }

  const q = raw ?? "";

  if (q.length > 50) {
    return res.status(400).json({ message: "q is too long" });
  }

  const [rows] = await pool.execute(
    `SELECT p.id, p.user_id, p.title, p.content,
      p.created_at, u.name AS authorName
     FROM posts p JOIN users u ON p.user_id = u.id
     WHERE p.title LIKE ?
     ORDER BY p.id DESC`,
    [`%${q}%`]
  );

  res.json(rows);
});

// 게시글 상세 조회
postRouter.get("/:id", async (req, res) => {
  const idNum = Number(req.params.id);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const [rows]: any = await pool.execute(
    `SELECT p.*, u.name AS authorName
     FROM posts p JOIN users u ON p.user_id = u.id
     WHERE p.id = ?`,
    [idNum]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "not found" });
  }

  const [attachments] = await pool.execute(
    `SELECT id, original_name, stored_name, size
     FROM attachments WHERE post_id = ?`,
    [idNum]
  );

  res.json({ ...rows[0], attachments });
});

// 게시글 작성
postRouter.post("/", requireAuth, async (req, res) => {
  const user = req.session.user as any;
  const { title, content, userId } = req.body;
  const targetUserId = userId ?? user?.id ?? 1;

  if (typeof title !== "string" || typeof content !== "string") {
    return res.status(400).json({
      message: "Title and content must be strings"
    });
  }

  if (title.length < 1 || title.length > 100) {
    return res.status(400).json({
      message: "Title length must be between 1 and 100"
    });
  }

  if (content.length < 1 || content.length > 5000) {
    return res.status(400).json({
      message: "Content length must be between 1 and 5000"
    });
  }

  const [result]: any = await pool.execute(
    `INSERT INTO posts(user_id, title, content) VALUES (?, ?, ?)`,
    [targetUserId, title, content]
  );

  res.json({ message: "created", id: result.insertId });
});

// 게시글 수정
postRouter.put("/:id", requireAuth, async (req, res) => {
  const idNum = Number(req.params.id);
  const { title, content } = req.body;

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (typeof title !== "string" || typeof content !== "string") {
    return res.status(400).json({
      message: "Title and content must be strings"
    });
  }

  if (
    title.length < 1 ||
    title.length > 100 ||
    content.length < 1 ||
    content.length > 5000
  ) {
    return res.status(400).json({ message: "Invalid input length" });
  }

  await pool.execute(
    `UPDATE posts SET title = ?, content = ? WHERE id = ?`,
    [title, content, idNum]
  );

  res.json({ message: "updated" });
});

// 게시글 삭제
postRouter.delete("/:id", async (req, res) => {
  const idNum = Number(req.params.id);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  await pool.execute(
    `DELETE FROM posts WHERE id = ?`,
    [idNum]
  );

  res.json({ message: "deleted" });
});
