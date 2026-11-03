import "server-only";
import { all, get } from "./db";

export type MailFolder = "inbox" | "sent" | "drafts" | "starred" | "spam" | "trash";

export type Mail = {
  id: number;
  from_user_id: number;
  to_user_id: number;
  subject: string;
  body: string;
  read_at: string | null;
  starred_by_receiver: number;
  deleted_by_sender: number;
  deleted_by_receiver: number;
  folder: string;
  created_at: string;
  from_username: string;
  from_nickname: string;
  from_color: string;
  to_username: string;
  to_nickname: string;
};

export type MailDraft = {
  id: number;
  user_id: number;
  to_address: string;
  subject: string;
  body: string;
  updated_at: string;
};

export const FOLDERS: Array<{ key: MailFolder; name: string; href: string }> = [
  { key: "inbox", name: "받은메일함", href: "/mail" },
  { key: "sent", name: "보낸메일함", href: "/mail/sent" },
  { key: "drafts", name: "임시보관함", href: "/mail/drafts" },
  { key: "starred", name: "별표메일", href: "/mail/starred" },
  { key: "spam", name: "스팸메일함", href: "/mail/spam" },
  { key: "trash", name: "휴지통", href: "/mail/trash" },
];

const MAIL_SELECT = `
  SELECT m.*, f.username from_username, f.nickname from_nickname, f.avatar_color from_color,
         t.username to_username, t.nickname to_nickname
    FROM mails m JOIN users f ON f.id = m.from_user_id JOIN users t ON t.id = m.to_user_id`;

/**
 * 폴더별 조건. deleted_* : 0 보임, 1 휴지통, 2 영구삭제.
 */
function folderWhere(folder: MailFolder, userId: number): { where: string; params: number[] } {
  switch (folder) {
    case "inbox":
      return { where: "m.to_user_id = ? AND m.deleted_by_receiver = 0 AND m.folder = 'inbox'", params: [userId] };
    case "sent":
      return { where: "m.from_user_id = ? AND m.deleted_by_sender = 0", params: [userId] };
    case "starred":
      return { where: "m.to_user_id = ? AND m.deleted_by_receiver = 0 AND m.starred_by_receiver = 1", params: [userId] };
    case "spam":
      return { where: "m.to_user_id = ? AND m.deleted_by_receiver = 0 AND m.folder = 'spam'", params: [userId] };
    case "trash":
      return {
        where: "((m.to_user_id = ? AND m.deleted_by_receiver = 1) OR (m.from_user_id = ? AND m.deleted_by_sender = 1))",
        params: [userId, userId],
      };
    default:
      return { where: "0", params: [] };
  }
}

export const PAGE_SIZE = 15;

export function listMails(folder: MailFolder, userId: number, page = 1): { mails: Mail[]; total: number } {
  const { where, params } = folderWhere(folder, userId);
  const total = get<{ c: number }>(`SELECT COUNT(*) c FROM mails m WHERE ${where}`, ...params)?.c ?? 0;
  const mails = all<Mail>(
    `${MAIL_SELECT} WHERE ${where} ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
    ...params, PAGE_SIZE, (page - 1) * PAGE_SIZE,
  );
  return { mails, total };
}

export function listDrafts(userId: number): MailDraft[] {
  return all<MailDraft>("SELECT * FROM mail_drafts WHERE user_id = ? ORDER BY updated_at DESC", userId);
}

export function getDraft(id: number, userId: number): MailDraft | undefined {
  return get<MailDraft>("SELECT * FROM mail_drafts WHERE id = ? AND user_id = ?", id, userId);
}

/** 폴더별 건수 (받은메일함은 안 읽은 수). */
export function folderCounts(userId: number): Record<MailFolder, number> {
  const unread = get<{ c: number }>(
    "SELECT COUNT(*) c FROM mails m WHERE m.to_user_id = ? AND m.deleted_by_receiver = 0 AND m.folder = 'inbox' AND m.read_at IS NULL",
    userId,
  )?.c ?? 0;
  const count = (f: MailFolder) => {
    const { where, params } = folderWhere(f, userId);
    return get<{ c: number }>(`SELECT COUNT(*) c FROM mails m WHERE ${where}`, ...params)?.c ?? 0;
  };
  return {
    inbox: unread,
    sent: count("sent"),
    drafts: get<{ c: number }>("SELECT COUNT(*) c FROM mail_drafts WHERE user_id = ?", userId)?.c ?? 0,
    starred: count("starred"),
    spam: count("spam"),
    trash: count("trash"),
  };
}

/** 보낸 사람 또는 받는 사람만 열람 가능. 영구삭제된 쪽은 볼 수 없다. */
export function getMailFor(id: number, userId: number): Mail | undefined {
  const m = get<Mail>(`${MAIL_SELECT} WHERE m.id = ?`, id);
  if (!m) return undefined;
  if (m.to_user_id === userId && m.deleted_by_receiver < 2) return m;
  if (m.from_user_id === userId && m.deleted_by_sender < 2) return m;
  return undefined;
}

export function searchContacts(q: string, limit = 8) {
  const like = `%${q.toLowerCase()}%`;
  return all<{ username: string; nickname: string; avatar_color: string }>(
    "SELECT username, nickname, avatar_color FROM users WHERE username LIKE ? OR nickname LIKE ? ORDER BY username LIMIT ?",
    like, like, limit,
  );
}

export function searchMails(userId: number, q: string): Mail[] {
  const like = `%${q}%`;
  return all<Mail>(
    `${MAIL_SELECT} WHERE ((m.to_user_id = ? AND m.deleted_by_receiver < 2) OR (m.from_user_id = ? AND m.deleted_by_sender < 2))
       AND (m.subject LIKE ? OR m.body LIKE ? OR f.nickname LIKE ? OR t.nickname LIKE ?) ORDER BY m.created_at DESC LIMIT 50`,
    userId, userId, like, like, like, like,
  );
}

/** 목록용 시간 표기: 오늘이면 HH:MM, 아니면 MM-DD */
export function mailTime(iso: string): string {
  const today = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}`;
  return iso.startsWith(todayStr) ? iso.slice(11, 16) : iso.slice(5, 10).replace("-", ".");
}
