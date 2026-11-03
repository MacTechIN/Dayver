"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveDraftAction, sendMailAction, type MailFormState } from "@/lib/actions/mail";

type Contact = { username: string; nickname: string; avatar_color: string; address: string };

/**
 * 메일쓰기: 받는사람(자동완성), 제목, 본문, 보내기/임시저장/취소.
 */
export function ComposeForm({ initial, draftId, savedNotice }: {
  initial: { to: string; subject: string; body: string };
  draftId?: number;
  savedNotice?: boolean;
}) {
  const [sendState, sendFormAction, sending] = useActionState(sendMailAction, undefined);
  const [draftState, draftFormAction, saving] = useActionState(saveDraftAction, undefined);
  const [to, setTo] = useState(initial.to);
  const [items, setItems] = useState<Contact[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const lastToken = to.split(/[,;\s]+/).pop() ?? "";
  const queryToken = !lastToken || lastToken.includes("@") ? "" : lastToken;

  // 마지막 토큰 기준 자동완성 (100ms 디바운스: 네이버 검색창의 setTimeout(100) 패턴 재해석)
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!queryToken) return;
    const last = queryToken;
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/mail/contacts?q=${encodeURIComponent(last)}`);
        const data = (await res.json()) as { items: Contact[] };
        setItems(data.items ?? []);
        setOpen(true);
      } catch {
        setItems([]);
      }
    }, 100);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [queryToken]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (c: Contact) => {
    const parts = to.split(/[,;\s]+/).filter(Boolean);
    parts.pop();
    parts.push(c.address);
    setTo(parts.join(", ") + ", ");
    setOpen(false);
  };

  const state: MailFormState = sendState ?? draftState;
  const busy = sending || saving;
  return (
    <form action={sendFormAction} className="dv-card">
      {draftId && <input type="hidden" name="draft_id" value={draftId} />}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-dv-border bg-dv-bg-3">
        <button type="submit" disabled={busy} className="dv-btn-green px-5 py-2 text-[14px] disabled:opacity-60">{sending ? "보내는 중…" : "보내기"}</button>
        <button type="submit" formAction={draftFormAction} disabled={busy} className="px-4 py-2 border border-dv-border rounded bg-white text-[14px] disabled:opacity-60">임시저장</button>
        <Link href="/mail" className="px-4 py-2 border border-dv-border rounded bg-white text-[14px]">취소</Link>
        {(draftState?.saved || savedNotice) && <span className="ml-3 text-[12px] text-dv-text-3" role="status">{draftState?.saved ?? "임시보관함에 저장되었습니다."}</span>}
      </div>
      <div className="px-5 divide-y divide-dv-border-2">
        <div ref={boxRef} className="relative flex items-start gap-3 py-3">
          <label htmlFor="to" className="w-16 pt-1.5 text-[13px] text-dv-text-2">받는사람</label>
          <div className="flex-1">
            <input
              id="to"
              name="to"
              value={to}
              onChange={(e) => {
                const v = e.target.value;
                setTo(v);
                const last = v.split(/[,;\s]+/).pop() ?? "";
                if (!last || last.includes("@")) setItems([]);
              }}
              onFocus={() => items.length && setOpen(true)}
              autoComplete="off"
              placeholder="아이디 또는 아이디@dayver.com (쉼표로 여러 명)"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls="to-suggest"
              className="w-full py-1.5 outline-none text-[14px]"
            />
            {open && items.length > 0 && (
              <ul id="to-suggest" role="listbox" className="absolute left-16 right-0 top-full z-20 dv-card shadow-lg max-h-64 overflow-auto">
                {items.map((c) => (
                  <li key={c.username} role="option" aria-selected={false}>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)} className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-dv-bg-2">
                      <span className="w-7 h-7 rounded-full grid place-items-center text-white text-[12px] font-bold" style={{ background: c.avatar_color }} aria-hidden>{c.nickname.slice(0, 1)}</span>
                      <span className="text-[14px]">{c.nickname}</span>
                      <span className="text-[12px] text-dv-text-3">{c.address}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 py-3">
          <label htmlFor="subject" className="w-16 text-[13px] text-dv-text-2">제목</label>
          <input id="subject" name="subject" defaultValue={initial.subject} placeholder="제목을 입력하세요" className="flex-1 py-1.5 outline-none text-[14px]" />
        </div>
        <div className="py-3">
          <label htmlFor="body" className="sr-only">본문</label>
          <textarea id="body" name="body" defaultValue={initial.body} rows={18} placeholder="내용을 입력하세요" className="w-full outline-none text-[14px] leading-relaxed resize-y" />
        </div>
      </div>
      {state?.error && <p role="alert" className="px-5 pb-4 text-dv-red text-[13px]">{state.error}</p>}
    </form>
  );
}
