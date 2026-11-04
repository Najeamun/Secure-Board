import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { authRouter } from "./routes/auth.js";
import { postRouter } from "./routes/posts.js";
import { commentRouter } from "./routes/comments.js";
import { adminRouter } from "./routes/admin.js";
import { fileRouter } from "./routes/files.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, req.body ?? "");
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET ?? "class-secret-2026",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,
    secure: false
  }
}));

app.get("/api/health", (_req, res) => {
  res.json({ok: true, env: process.env.NODE_ENV, node: process.version});
});

app.use("/api/auth", authRouter);
app.use("/api/posts/:postId/comments", commentRouter);
app.use("/api/posts", postRouter);
app.use("/api/admin", adminRouter);
app.use("/api/files", fileRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: err.message,
    stack: err.stack,
    detail: err
  });
});

app.listen(Number(process.env.PORT ?? 3001), () => {
  console.log(`server started: http://localhost:${process.env.PORT ?? 3001}`);
});
