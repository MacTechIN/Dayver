"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { Mail, MailFolder } from "@/lib/mail";
import { deleteMailsAction, markReadAction, moveFolderAction, restoreMailsAction, toggleStarAction } from "@/lib/actions/mail";

type Props = {
  folder: MailFolder;
  mails: Mail[];
  userId: number;
  page: number;
  total: number;
  pageSize: number;
  returnTo: string;
  timeOf: Record<number, string>;
  title: string;
};

/**
 * 메일 목록: 체크박스 전체선택 + 도구막대(읽음/안읽음/삭제/스팸/별표/새로고침) + 행(별표, 보낸사람, 제목, 시간).
 * 도구막대의 각 버튼은 같은 <form>의 formAction으로 서버 액션을 호출한다.
 */
export function MailList({ folder, mails, userId, page, total, pageSize, returnTo, timeOf, title }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const formId = useId();
  const allChecked = mails.length > 0 && checked.size === mails.length;
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(mails.map((m) => m.id)));
  const toggle = (id: number) => setChecked((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const isInboxLike = folder === "inbox" || folder === "starred" || folder === "spam";
  const btn = "px-3 py-1.5 text-[13px] border border-dv-border rounded bg-white disabled:opacity-40 hover:bg-dv-bg-3";

  return (
    <section aria-label={title}>
      <h1 className="text-[20px] font-bold mb-3">
        {title} <span className="text-[13px] text-dv-text-3 font-normal ml-1">전체 {total}</span>
      </h1>
      <form id={formId} className="dv-card">
        <input type="hidden" name="return" value={returnTo} />
        {Array.from(checked).map((id) => <input key={id} type="hidden" name="ids" value={id} />)}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-dv-border bg-dv-bg-3" role="toolbar" aria-label="메일 도구">
          <label className="flex items-center gap-1 mr-2 text-[13px]">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="전체 선택" />
          </label>
          {isInboxLike && (
            <>
              <button formAction={markReadAction} name="read" value="1" disabled={checked.size === 0} className={btn}>읽음</button>
              <button formAction={markReadAction} name="read" value="0" disabled={checked.size === 0} className={btn}>안읽음</button>
            </>
          )}
          {folder === "trash" ? (
            <>
              <button formAction={restoreMailsAction} disabled={checked.size === 0} className={btn}>복구</button>
              <button formAction={deleteMailsAction} name="purge" value="1" disabled={checked.size === 0} className={`${btn} text-dv-red`}>영구삭제</button>
            </>
          ) : (
            <button formAction={deleteMailsAction} disabled={checked.size === 0} className={btn}>삭제</button>
          )}
          {folder === "spam" ? (
            <button formAction={moveFolderAction} name="folder" value="inbox" disabled={checked.size === 0} className={btn}>스팸해제</button>
          ) : isInboxLike ? (
            <button formAction={moveFolderAction} name="folder" value="spam" disabled={checked.size === 0} className={btn}>스팸신고</button>
          ) : null}
          {isInboxLike && (
            <>
              <button formAction={toggleStarAction} name="star" value="1" disabled={checked.size === 0} className={btn}>별표</button>
              <button formAction={toggleStarAction} name="star" value="0" disabled={checked.size === 0} className={btn}>별표해제</button>
            </>
          )}
          <a href={returnTo} className={`${btn} ml-auto`} aria-label="새로고침">⟳ 새로고침</a>
        </div>
        <ul className="divide-y divide-dv-border-2">
          {mails.length === 0 && <li className="py-20 text-center text-dv-text-3">메일이 없습니다.</li>}
          {mails.map((m) => {
            const unread = m.to_user_id === userId && !m.read_at && folder !== "sent";
            const other = folder === "sent" || m.from_user_id === userId && m.to_user_id !== userId ? { nick: m.to_nickname, user: m.to_username } : { nick: m.from_nickname, user: m.from_username };
            return (
              <li key={m.id} className={`flex items-center gap-3 px-4 py-2.5 text-[14px] hover:bg-dv-bg-3 ${unread ? "font-bold" : ""}`}>
                <input type="checkbox" checked={checked.has(m.id)} onChange={() => toggle(m.id)} aria-label={`${m.subject} 선택`} />
                <span className={`w-4 text-center ${m.starred_by_receiver ? "text-[#f2a900]" : "text-dv-border"}`} aria-label={m.starred_by_receiver ? "별표" : ""}>★</span>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: unread ? "var(--dv-green)" : "transparent" }} aria-hidden />
                <span className="w-[200px] dv-ellipsis" title={`${other.user}@dayver.com`}>
                  {folder === "sent" && <span className="text-dv-text-3 font-normal mr-1">받는사람:</span>}
                  {other.nick} <span className="text-dv-text-3 font-normal text-[12px]">&lt;{other.user}@dayver.com&gt;</span>
                </span>
                <Link href={`/mail/${m.id}`} data-clk={`mail.list.${folder}.subject`} className="flex-1 min-w-0 dv-ellipsis">{m.subject}</Link>
                <time className="w-14 text-right text-[12px] text-dv-text-3 font-normal" dateTime={m.created_at}>{timeOf[m.id]}</time>
              </li>
            );
          })}
        </ul>
      </form>
      <nav aria-label="페이지" className="flex justify-center items-center gap-1 py-5 text-[13px]">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Link key={p} href={`${returnTo.split("?")[0]}?page=${p}`} aria-current={p === page ? "page" : undefined} className={`w-7 h-7 grid place-items-center rounded ${p === page ? "bg-dv-text text-white" : "text-dv-text-2"}`}>{p}</Link>
        ))}
      </nav>
    </section>
  );
}
