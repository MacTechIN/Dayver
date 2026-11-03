import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDraft, getMailFor } from "@/lib/mail";
import { MailShell } from "@/components/mail/MailShell";
import { ComposeForm } from "@/components/mail/ComposeForm";

export const metadata: Metadata = { title: "메일쓰기 - DAYVER 메일" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

function quote(body: string) {
  return body.split("\n").map((l) => `> ${l}`).join("\n");
}

export default async function WritePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mail/write");

  let initial = { to: str(sp.to), subject: str(sp.subject), body: "" };
  let draftId: number | undefined;

  const replyId = Number(sp.reply ?? 0);
  const forwardId = Number(sp.forward ?? 0);
  const draftParam = Number(sp.draft ?? 0);

  if (replyId) {
    const m = getMailFor(replyId, user.id);
    if (m) {
      const all = sp.all === "1";
      const to = [m.from_username, ...(all && m.to_user_id !== user.id ? [m.to_username] : [])].filter((u) => u !== user.username);
      initial = {
        to: (to.length ? to : [m.from_username]).map((u) => `${u}@dayver.com`).join(", "),
        subject: m.subject.startsWith("RE:") ? m.subject : `RE: ${m.subject}`,
        body: `\n\n-----원본 메일-----\n보낸사람: ${m.from_nickname} <${m.from_username}@dayver.com>\n날짜: ${m.created_at}\n\n${quote(m.body)}`,
      };
    }
  } else if (forwardId) {
    const m = getMailFor(forwardId, user.id);
    if (m) {
      initial = {
        to: "",
        subject: m.subject.startsWith("FW:") ? m.subject : `FW: ${m.subject}`,
        body: `\n\n-----전달된 메일-----\n보낸사람: ${m.from_nickname} <${m.from_username}@dayver.com>\n받는사람: ${m.to_nickname} <${m.to_username}@dayver.com>\n날짜: ${m.created_at}\n제목: ${m.subject}\n\n${m.body}`,
      };
    }
  } else if (draftParam) {
    const d = getDraft(draftParam, user.id);
    if (d) {
      draftId = d.id;
      initial = { to: d.to_address, subject: d.subject, body: d.body };
    }
  }

  return (
    <MailShell user={user} current="write">
      <h1 className="text-[20px] font-bold mb-3">메일쓰기</h1>
      <ComposeForm key={`${replyId}-${forwardId}-${draftId ?? 0}`} initial={initial} draftId={draftId} savedNotice={sp.saved === "1"} />
    </MailShell>
  );
}
