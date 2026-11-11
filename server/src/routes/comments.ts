
import { Router } from "express";
import { pool } from "../db/pool.js";
import type { Request, Response, NextFunction } from "express";

export const commentRouter = Router({ mergeParams: true });

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  next();
}
commentRouter.get("/", async (req, res) => {
  const { postId } = req.params as Record<string, string>;
  const postIdNum = Number(postId);

  if (!Number.isInteger(postIdNum) || postIdNum <= 0) {
    return res.status(400).json({ message: "Invalid postId format" });
  }

  const [rows] = await pool.execute(
    `SELECT c.id, c.user_id, c.content, c.created_at, u.name AS authorName
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.id`,
    [postIdNum]
  );

  res.json(rows);
});

commentRouter.post("/", requireAuth, async (req, res) => {
  const { postId } = req.params as Record<string, string>;
  const postIdNum = Number(postId);
  const user = req.session.user as any;
  const { content } = req.body;
  const userId = user?.id ?? 1;

  if (!Number.isInteger(postIdNum) || postIdNum <= 0) {
    return res.status(400).json({ message: "Invalid postId format" });
  }

  if (typeof content !== "string") {
    return res.status(400).json({ message: "Content must be a string" });
  }

  if (content.length < 1 || content.length > 500) {
    return res.status(400).json({
      message: "Comment length must be between 1 and 500"
    });
  }

  await pool.execute(
    `INSERT INTO comments(post_id, user_id, content) VALUES (?, ?, ?)`,
    [postIdNum, userId, content]
  );

  res.json({ message: "created" });
});

commentRouter.delete("/:commentId", requireAuth, async (req, res) => {
  const { commentId } = req.params as Record<string, string>;
  const commentIdNum = Number(commentId);

  if (!Number.isInteger(commentIdNum) || commentIdNum <= 0) {
    return res.status(400).json({ message: "Invalid commentId format" });
  }

  await pool.execute(
    `DELETE FROM comments WHERE id = ?`,
    [commentIdNum]
  );

  res.json({ message: "deleted" });
});
