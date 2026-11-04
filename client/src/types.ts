export type User = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type Post = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  authorName: string;
};

export type Attachment = {
  id: number;
  original_name: string;
  stored_name: string;
  size: number;
};

export type PostDetail = Post & {
  attachments: Attachment[];
};

export type Comment = {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  authorName: string;
};

export type AdminUser = User & {
  password_hash: string;
};
