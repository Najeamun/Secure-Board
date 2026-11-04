# 서버 주소 약속 (API)

화면과 서버가 주고받는 "약속"입니다.
교수님 채점 프로그램도 이 약속대로 요청을 보내므로 **주소, 방식, 값의 이름은 바꾸지 마세요.**
서버 내부 구현과 화면은 자유롭게 바꿔도 됩니다.

- 모든 주소는 `/api`로 시작합니다.
- 보내는 값은 JSON입니다. (첨부파일 업로드만 `multipart/form-data`)
- 로그인 상태는 세션 쿠키로 유지됩니다.

## 응답 코드 약속

| 코드 | 뜻 | 언제 |
|---|---|---|
| 200 | 성공 | |
| 400 | 보낸 값이 잘못됨 | 형식, 길이, 종류가 규칙에 맞지 않을 때 |
| 401 | 로그인이 필요함 | 로그인하지 않았거나 로그인에 실패했을 때 |
| 403 | 권한이 없음 | 로그인은 했지만 이 일을 할 권한이 없을 때 |
| 404 | 없음 | 찾는 글, 댓글, 파일이 없을 때 (권한 없는 대상에 404를 줘도 됩니다) |
| 429 | 너무 많이 시도함 | 로그인 실패가 너무 많을 때 (11주차부터) |
| 500 | 서버 오류 | |

## 회원

| 방식 | 주소 | 보내는 값 | 돌려받는 값 |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password, name }` | `{ message }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ id, email, name, role }` |
| GET | `/api/auth/me` | 없음 | `{ id, email, name, role }` 또는 401 |
| POST | `/api/auth/logout` | 없음 | `{ message }` |
| GET | `/api/auth/csrf` | 없음 | `{ csrfToken }` (13주차에 직접 만듭니다) |

## 게시글

| 방식 | 주소 | 보내는 값 | 돌려받는 값 |
|---|---|---|---|
| GET | `/api/posts?q=검색어` | 없음 | `[{ id, user_id, title, content, created_at, authorName }]` |
| GET | `/api/posts/:id` | 없음 | `{ id, user_id, title, content, created_at, authorName, attachments: [...] }` |
| POST | `/api/posts` | `{ title, content }` | `{ message, id }` |
| PUT | `/api/posts/:id` | `{ title, content }` | `{ message }` |
| DELETE | `/api/posts/:id` | 없음 | `{ message }` |

## 댓글

| 방식 | 주소 | 보내는 값 | 돌려받는 값 |
|---|---|---|---|
| GET | `/api/posts/:postId/comments` | 없음 | `[{ id, user_id, content, created_at, authorName }]` |
| POST | `/api/posts/:postId/comments` | `{ content }` | `{ message }` |
| DELETE | `/api/posts/:postId/comments/:commentId` | 없음 | `{ message }` |

## 첨부파일

| 방식 | 주소 | 보내는 값 | 돌려받는 값 |
|---|---|---|---|
| POST | `/api/files/upload` | form-data: `postId`, `file` | `{ message, ... }` |
| GET | `/api/files/download?name=저장된이름` | 없음 | 파일 내용 |

14주차에 다운로드 방식을 `GET /api/files/:id`처럼 번호 기반으로 바꿔도 됩니다. 바꾼다면 화면도 함께 바꾸고 보고서에 적으세요.

## 관리자

| 방식 | 주소 | 보내는 값 | 돌려받는 값 |
|---|---|---|---|
| GET | `/api/admin/users` | 없음 | `[{ id, email, name, role }]` |
| POST | `/api/admin/users/:id/role` | `{ role }` (`USER` 또는 `ADMIN`) | `{ message }` |

## CSRF 토큰 약속 (13주차부터)

1. 화면은 `GET /api/auth/csrf`로 토큰을 받습니다.
2. 상태를 바꾸는 모든 요청(POST, PUT, DELETE)에 `X-CSRF-Token` 헤더로 그 토큰을 붙입니다.
3. 서버는 토큰이 없거나 틀리면 403을 돌려줍니다.
