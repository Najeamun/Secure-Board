import { Router } from "express";
import { pool } from "../db/pool.js";

export const commentRouter = Router({mergeParams: true});

commentRouter.get("/", async (req, res) => {
  const {postId} = req.params as Record<string, string>;
  const [rows] = await pool.query(
    `SELECT c.id, c.user_id, c.content, c.created_at, u.name AS authorName
     FROM comments c JOIN users u ON c.user_id=u.id
     WHERE c.post_id=${postId}
     ORDER BY c.id`
  );
  res.json(rows);
});

commentRouter.post("/", async (req, res) => {
  const {postId} = req.params as Record<string, string>;
  const user = req.session.user as any;
  const {content} = req.body;

  await pool.query(
    `INSERT INTO comments(post_id, user_id, content)
     VALUES (${postId}, ${user?.id ?? 1}, '${content}')`
  );
  res.json({message: "created"});
});

commentRouter.delete("/:commentId", async (req, res) => {
  const {commentId} = req.params as Record<string, string>;
  await pool.query(`DELETE FROM comments WHERE id=${commentId}`);
  res.json({message: "deleted"});
});
