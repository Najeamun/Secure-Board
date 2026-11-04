# Secure Board

시큐어코딩 수업에서 한 학기 동안 함께 고쳐 나갈 **게시판**입니다.

> 이 게시판은 일부러 **안전하지 않게** 만들어져 있습니다.
> 9주차에는 구조를 익히고, 10~14주차에는 매주 정해진 보안 문제를 찾아서 고칩니다.
> 실제 서비스나 공개된 인터넷에 올리지 마세요. 내 PC에서만 실행합니다.

## 무엇으로 만들었나

| 덩어리 | 하는 일 | 기술 | 폴더 |
|---|---|---|---|
| 화면 | 브라우저에 보이는 부분 | React + TypeScript (Vite) | `client/` |
| 서버 | 요청을 받아 처리하는 부분 | Node.js + Express + TypeScript | `server/` |
| 데이터베이스 | 회원, 글, 댓글, 첨부파일 정보를 저장 | MySQL | `db/schema.sql` |

식당에 비유하면 **화면은 주문서, 서버는 주방, 데이터베이스는 창고**입니다.

## 실행 방법

준비물: Node.js 20 이상, MySQL 8

1. **서버 설정 파일 만들기**
   `server/.env.example`을 복사해서 `server/.env`를 만들고, 내 MySQL 비밀번호와 포트에 맞게 고칩니다.
2. **서버 준비**
   ```bash
   cd server
   npm install
   npm run db:reset    # DB를 만들고 예시 데이터를 넣습니다
   npm run dev         # http://localhost:3001 에서 서버가 켜집니다
   ```
3. **화면 준비** (새 터미널 창에서)
   ```bash
   cd client
   npm install
   npm run dev         # http://localhost:5173 을 브라우저로 엽니다
   ```
4. 브라우저에 게시판 목록이 보이면 성공입니다.

데이터가 엉망이 되면 언제든 `server` 폴더에서 `npm run db:reset`을 실행하세요. 처음 상태로 돌아갑니다.

## 기본 계정

| 이메일 | 비밀번호 | 권한 |
|---|---|---|
| admin@school.test | admin1234 | 관리자 |
| student1@school.test | student1234 | 일반 |
| student2@school.test | student1234 | 일반 |

## 기능

회원가입 · 로그인 · 로그아웃 · 글 목록 · 제목 검색 · 글 보기 · 글쓰기 · 글 수정 · 글 삭제 · 댓글 쓰기/삭제 · 첨부파일 올리기/내려받기 · 관리자 회원 관리

## 어디에 무엇이 있나

```
server/src/
  index.ts            서버 시작, 세션·쿠키 설정, 오류 처리
  db/pool.ts          데이터베이스 연결
  routes/auth.ts      회원가입, 로그인, 로그아웃, 내 정보
  routes/posts.ts     글 목록·검색·보기·쓰기·수정·삭제
  routes/comments.ts  댓글
  routes/admin.ts     관리자 기능
  routes/files.ts     첨부파일 올리기·내려받기
client/src/
  App.tsx             위쪽 메뉴, 화면 전환
  api.ts              서버에 요청을 보내는 함수
  pages/              화면별 파일 (목록, 글 보기, 글쓰기, 로그인, 회원가입, 관리자)
  styles.css          디자인
db/schema.sql         표(테이블) 구조와 예시 데이터
docs/API.md           서버 주소 약속 (바꾸면 안 되는 것)
docs/REQUIREMENTS.md  주차별 보안 요구사항
AGENTS.md 외 3개      AI 코딩 도구가 읽는 안내 파일 (수정 금지)
```

## 바꿔도 되는 것과 지켜야 하는 것

**마음대로 바꿔도 됩니다**
- 화면 디자인, 문구, 배치, 색 (`client/` 전체)
- 새 화면이나 기능 추가
- 서버 내부 코드 구조 (파일 나누기, 함수 만들기 등)

**지켜야 합니다** (교수님 채점 프로그램이 이 약속으로 테스트합니다)
- `docs/API.md`에 적힌 서버 주소, 보내는 값의 이름, 돌려주는 값의 형태
- DB의 `users` 표의 `email`, `role` 칸 이름
- `npm run db:reset`, `npm run dev`로 실행되는 것
- `package-lock.json` 파일 (모든 팀이 같은 버전으로 설치하게 해 줍니다. 지우지 말고 함께 커밋하세요)
- AI 안내 파일 4개는 **수정하거나 지우지 않습니다.** 채점 때 원본과 같은지 확인하며, 바뀌어 있으면 감점입니다.
  (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`)

## 학기 진행 규칙

- 매주 정해진 범위의 보안 문제만 고칩니다. 범위는 `docs/REQUIREMENTS.md`를 보세요.
- 고치기 **전에** 문제가 실제로 일어나는 것을 확인하고, 그 증거(요청과 응답 캡처)를 보고서에 붙입니다.
- 커밋은 의미 있는 단위로 나눠서 남깁니다.
  - 좋은 예: `fix: parameterize post search query`, `security: check post ownership before delete`
  - 나쁜 예: `수정`, `최종`, `진짜최종`
- AI 도구를 써도 됩니다. 단, 내가 낸 코드를 내가 설명할 수 있어야 합니다.

## AI 도구를 쓸 때

이 프로젝트에는 AI 코딩 도구(Claude Code, Codex, Cursor, Copilot, Gemini CLI 등)가 자동으로 읽는 안내 파일이 들어 있습니다.
AI는 이 파일에 따라 **튜터처럼** 도와줍니다.

- "보안 문제 다 찾아서 고쳐줘"처럼 한꺼번에 해 달라고 하면 AI가 거절합니다. 몇 주차인지 알려 주면 그 주 범위만 도와줍니다.
- AI는 약점 위치를 먼저 알려 주지 않고, 질문과 힌트로 직접 찾게 도와줍니다.
- 화면 꾸미기, 설치·실행 오류, Git 사용법, 보안 개념 설명은 자유롭게 물어보세요.

AI가 전부 고쳐 준 코드는 어차피 점수가 되지 않습니다.
- 매주 Git tag, Pull Request, 보고서로 **그 주에 한 작업**을 평가합니다.
- 채점 테스트는 보안과 함께 **정상 기능**도 확인합니다. AI가 기능까지 막아 버리면 점수를 잃습니다.
- Code Defense에서 설명하지 못한 수정은 절반만 인정합니다.
