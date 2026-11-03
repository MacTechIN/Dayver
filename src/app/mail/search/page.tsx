import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { mailTime, searchMails } from "@/lib/mail";
import { MailShell } from "@/components/mail/MailShell";

export const metadata: Metadata = { title: "메일 검색 - DAYVER 메일" };

export default async function MailSearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.query === "string" ? sp.query.trim() : "";
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/mail/search?query=${q}`)}`);
  const mails = q ? searchMails(user.id, q) : [];
  return (
    <MailShell user={user} current="inbox">
      <h1 className="text-[20px] font-bold mb-3">&apos;{q}&apos; 검색결과 <span className="text-[13px] text-dv-text-3 font-normal ml-1">{mails.length}건</span></h1>
      <ul className="dv-card divide-y divide-dv-border-2">
        {mails.length === 0 && <li className="py-20 text-center text-dv-text-3">검색 결과가 없습니다.</li>}
        {mails.map((m) => (
          <li key={m.id} className={`flex items-center gap-3 px-4 py-3 text-[14px] hover:bg-dv-bg-3 ${m.to_user_id === user.id && !m.read_at ? "font-bold" : ""}`}>
            <span className="w-[200px] dv-ellipsis">{m.from_user_id === user.id ? `→ ${m.to_nickname}` : m.from_nickname}</span>
            <Link href={`/mail/${m.id}`} className="flex-1 min-w-0 dv-ellipsis">{m.subject}</Link>
            <time className="w-14 text-right text-[12px] text-dv-text-3 font-normal" dateTime={m.created_at}>{mailTime(m.created_at)}</time>
          </li>
        ))}
      </ul>
    </MailShell>
  );
}
