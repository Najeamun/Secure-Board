import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import "dotenv/config";
import crypto from "node:crypto";

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

const isProduction = process.env.NODE_ENV === "production";

app.use(session({
  name: "sid", // 필요 시 기존 쿠키 이름과 맞추기
  secret: process.env.SESSION_SECRET ?? "class-secret-2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  },
}));

app.get("/api/health", (_req, res) => {
  res.json({ok: true, env: process.env.NODE_ENV, node: process.version});
});

const CSRF_EXEMPT_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/csrf",
]);
const CSRF_METHODS = new Set(["POST", "PUT", "DELETE"]);

app.use("/api", (req, res, next) => {
  if (!CSRF_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  if (CSRF_EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  const headerToken = req.get("X-CSRF-Token");
  const sessionToken = req.session.csrfToken;

  if (
    typeof headerToken !== "string" ||
    typeof sessionToken !== "string" ||
    headerToken.length === 0 ||
    headerToken.length !== sessionToken.length
  ) {
    return res.status(403).json({ message: "Invalid or missing CSRF token" });
  }

  const isValid = crypto.timingSafeEqual(
    Buffer.from(headerToken, "utf8"),
    Buffer.from(sessionToken, "utf8")
  );

  if (!isValid) {
    return res.status(403).json({ message: "Invalid or missing CSRF token" });
  }

  next();
});

app.use("/api/auth", authRouter);
app.use("/api/posts/:postId/comments", commentRouter);
app.use("/api/posts", postRouter);
app.use("/api/admin", adminRouter);
app.use("/api/files", fileRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[ERROR]", {
    message: err?.message,
    code: err?.code,
    stack: err?.stack,
  });

  const statusCode =
    typeof err?.status === "number" && err.status >= 400 && err.status < 600
      ? err.status
      : typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;

  const clientMessage =
    statusCode === 400
      ? "잘못된 요청입니다."
      : statusCode === 401
      ? "인증이 필요합니다."
      : statusCode === 403
      ? "접근 권한이 없습니다."
      : statusCode === 404
      ? "요청한 리소스를 찾을 수 없습니다."
      : "서버 오류가 발생했습니다.";

  res.status(statusCode).json({ message: clientMessage });
});

app.listen(Number(process.env.PORT ?? 3001), () => {
  console.log(`server started: http://localhost:${process.env.PORT ?? 3001}`);
});
