import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { getMailFor } from "@/lib/mail";
import { deleteMailsAction, markReadAction, moveFolderAction, toggleStarAction } from "@/lib/actions/mail";
import { MailShell } from "@/components/mail/MailShell";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getCurrentUser();
  const m = user ? getMailFor(Number(id), user.id) : undefined;
  return { title: `${m?.subject ?? "메일"} - DAYVER 메일` };
}

export default async function MailReadPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/mail/${id}`);
  const m = getMailFor(Number(id), user.id);
  if (!m) notFound();
  const isReceiver = m.to_user_id === user.id;
  if (isReceiver && !m.read_at) run("UPDATE mails SET read_at = datetime('now','localtime') WHERE id = ?", m.id);
  const ret = isReceiver ? (m.folder === "spam" ? "/mail/spam" : "/mail") : "/mail/sent";
  const btn = "px-3 py-1.5 text-[13px] border border-dv-border rounded bg-white hover:bg-dv-bg-3";
  return (
    <MailShell user={user} current="read">
      <form className="dv-card">
        <input type="hidden" name="ids" value={m.id} />
        <input type="hidden" name="return" value={ret} />
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-dv-border bg-dv-bg-3" role="toolbar" aria-label="메일 도구">
          <Link href={`/mail/write?reply=${m.id}`} className={`${btn} font-bold`}>답장</Link>
          <Link href={`/mail/write?reply=${m.id}&all=1`} className={btn}>전체답장</Link>
          <Link href={`/mail/write?forward=${m.id}`} className={btn}>전달</Link>
          <button formAction={deleteMailsAction} className={btn}>삭제</button>
          {isReceiver && (
            <>
              <button formAction={moveFolderAction} name="folder" value={m.folder === "spam" ? "inbox" : "spam"} className={btn}>{m.folder === "spam" ? "스팸해제" : "스팸신고"}</button>
              <button formAction={toggleStarAction} name="star" value={m.starred_by_receiver ? "0" : "1"} className={btn}>{m.starred_by_receiver ? "★ 별표해제" : "☆ 별표"}</button>
              <button formAction={markReadAction} name="read" value="0" className={btn}>안읽음으로</button>
            </>
          )}
          <Link href={ret} className={`${btn} ml-auto`}>목록</Link>
        </div>
        <article className="px-8 py-6">
          <h1 className="text-[22px] font-bold leading-snug">{m.subject}</h1>
          <dl className="mt-4 text-[13px] grid grid-cols-[72px_1fr] gap-y-2 items-center">
            <dt className="text-dv-text-3">보낸사람</dt>
            <dd>
              <span className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-dv-bg-2">
                <span className="w-6 h-6 rounded-full grid place-items-center text-white text-[11px] font-bold" style={{ background: m.from_color }} aria-hidden>{m.from_nickname.slice(0, 1)}</span>
                <b>{m.from_nickname}</b>
                <span className="text-dv-text-3">&lt;{m.from_username}@dayver.com&gt;</span>
              </span>
            </dd>
            <dt className="text-dv-text-3">받는사람</dt>
            <dd>{m.to_nickname} <span className="text-dv-text-3">&lt;{m.to_username}@dayver.com&gt;</span></dd>
            <dt className="text-dv-text-3">날짜</dt>
            <dd><time dateTime={m.created_at}>{m.created_at}</time></dd>
          </dl>
          <div className="mt-8 pt-6 border-t border-dv-border-2 text-[15px] leading-[1.9] whitespace-pre-wrap min-h-[240px]">{m.body}</div>
        </article>
      </form>
    </MailShell>
  );
}
