"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { get, run, transaction } from "@/lib/db";

export type MailFormState = { error?: string; saved?: string } | undefined;

function resolveAddress(addr: string) {
  const username = addr.trim().toLowerCase().replace(/@dayver\.com$/, "");
  if (!username) return undefined;
  return get<{ id: number; username: string; nickname: string }>("SELECT id, username, nickname FROM users WHERE username = ?", username);
}

async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

function ids(form: FormData): number[] {
  return form.getAll("ids").map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0);
}

function back(form: FormData, fallback = "/mail") {
  const r = String(form.get("return") ?? "");
  return r.startsWith("/") ? r : fallback;
}

/** 보내기 */
export async function sendMailAction(_prev: MailFormState, form: FormData): Promise<MailFormState> {
  const user = await requireUser("/mail/write");
  const toRaw = String(form.get("to") ?? "");
  const subject = String(form.get("subject") ?? "").trim() || "(제목 없음)";
  const body = String(form.get("body") ?? "").trim();
  const draftId = Number(form.get("draft_id") ?? 0);
  const recipients = toRaw.split(/[,;\s]+/).filter(Boolean);
  if (recipients.length === 0) return { error: "받는사람을 입력해 주세요." };
  if (!body) return { error: "본문을 입력해 주세요." };
  const targets: Array<{ id: number; username: string; nickname: string }> = [];
  for (const rcpt of recipients) {
    const u = resolveAddress(rcpt);
    if (!u) return { error: `'${rcpt}' 은(는) 존재하지 않는 Dayver 주소입니다.` };
    if (!targets.some((t) => t.id === u.id)) targets.push(u);
  }
  transaction(() => {
    for (const t of targets) {
      run("INSERT INTO mails (from_user_id, to_user_id, subject, body) VALUES (?, ?, ?, ?)", user.id, t.id, subject, body);
      if (t.id !== user.id) {
        run(
          "INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'mail', ?, '/mail')",
          t.id, `${user.nickname}님에게서 새 메일: ${subject.slice(0, 30)}`,
        );
      }
    }
    if (draftId) run("DELETE FROM mail_drafts WHERE id = ? AND user_id = ?", draftId, user.id);
  });
  revalidatePath("/mail");
  redirect("/mail/sent?sent=1");
}

/** 임시저장 */
export async function saveDraftAction(_prev: MailFormState, form: FormData): Promise<MailFormState> {
  const user = await requireUser("/mail/write");
  const to = String(form.get("to") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const body = String(form.get("body") ?? "");
  const draftId = Number(form.get("draft_id") ?? 0);
  if (!to && !subject && !body.trim()) return { error: "저장할 내용이 없습니다." };
  if (draftId && get("SELECT 1 FROM mail_drafts WHERE id = ? AND user_id = ?", draftId, user.id)) {
    run("UPDATE mail_drafts SET to_address = ?, subject = ?, body = ?, updated_at = datetime('now','localtime') WHERE id = ?", to, subject, body, draftId);
    revalidatePath("/mail/drafts");
    return { saved: `${new Date().toTimeString().slice(0, 5)} 임시저장됨` };
  }
  const { lastId } = run("INSERT INTO mail_drafts (user_id, to_address, subject, body) VALUES (?, ?, ?, ?)", user.id, to, subject, body);
  revalidatePath("/mail/drafts");
  redirect(`/mail/write?draft=${lastId}&saved=1`);
}

export async function deleteDraftAction(form: FormData) {
  const user = await requireUser("/mail/drafts");
  for (const id of ids(form)) run("DELETE FROM mail_drafts WHERE id = ? AND user_id = ?", id, user.id);
  revalidatePath("/mail/drafts");
  redirect("/mail/drafts");
}

/** 삭제 (휴지통으로, 내 쪽만). 휴지통에서 삭제하면 영구삭제. */
export async function deleteMailsAction(form: FormData) {
  const user = await requireUser("/mail");
  const purge = form.get("purge") === "1";
  transaction(() => {
    for (const id of ids(form)) {
      const level = purge ? 2 : 1;
      run("UPDATE mails SET deleted_by_receiver = ? WHERE id = ? AND to_user_id = ? AND deleted_by_receiver < 2", level, id, user.id);
      run("UPDATE mails SET deleted_by_sender = ? WHERE id = ? AND from_user_id = ? AND deleted_by_sender < 2", level, id, user.id);
    }
    run("DELETE FROM mails WHERE deleted_by_receiver = 2 AND deleted_by_sender = 2");
  });
  revalidatePath("/mail");
  redirect(back(form));
}

/** 휴지통 복구 */
export async function restoreMailsAction(form: FormData) {
  const user = await requireUser("/mail/trash");
  for (const id of ids(form)) {
    run("UPDATE mails SET deleted_by_receiver = 0, folder = 'inbox' WHERE id = ? AND to_user_id = ? AND deleted_by_receiver = 1", id, user.id);
    run("UPDATE mails SET deleted_by_sender = 0 WHERE id = ? AND from_user_id = ? AND deleted_by_sender = 1", id, user.id);
  }
  revalidatePath("/mail");
  redirect("/mail/trash");
}

/** 휴지통 비우기 */
export async function emptyTrashAction() {
  const user = await requireUser("/mail/trash");
  transaction(() => {
    run("UPDATE mails SET deleted_by_receiver = 2 WHERE to_user_id = ? AND deleted_by_receiver = 1", user.id);
    run("UPDATE mails SET deleted_by_sender = 2 WHERE from_user_id = ? AND deleted_by_sender = 1", user.id);
    run("DELETE FROM mails WHERE deleted_by_receiver = 2 AND deleted_by_sender = 2");
  });
  revalidatePath("/mail");
  redirect("/mail/trash");
}

export async function toggleStarAction(form: FormData) {
  const user = await requireUser("/mail");
  const value = form.get("star") === "0" ? 0 : 1;
  for (const id of ids(form)) run("UPDATE mails SET starred_by_receiver = ? WHERE id = ? AND to_user_id = ?", value, id, user.id);
  revalidatePath("/mail");
  redirect(back(form));
}

export async function markReadAction(form: FormData) {
  const user = await requireUser("/mail");
  const read = form.get("read") !== "0";
  for (const id of ids(form)) {
    run(
      read
        ? "UPDATE mails SET read_at = COALESCE(read_at, datetime('now','localtime')) WHERE id = ? AND to_user_id = ?"
        : "UPDATE mails SET read_at = NULL WHERE id = ? AND to_user_id = ?",
      id, user.id,
    );
  }
  revalidatePath("/mail");
  redirect(back(form));
}

/** 스팸으로 이동 / 스팸 해제 */
export async function moveFolderAction(form: FormData) {
  const user = await requireUser("/mail");
  const folder = form.get("folder") === "spam" ? "spam" : "inbox";
  for (const id of ids(form)) run("UPDATE mails SET folder = ? WHERE id = ? AND to_user_id = ?", folder, id, user.id);
  revalidatePath("/mail");
  redirect(back(form));
}
