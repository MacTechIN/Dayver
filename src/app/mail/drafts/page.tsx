import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listDrafts, mailTime } from "@/lib/mail";
import { deleteDraftAction } from "@/lib/actions/mail";
import { MailShell } from "@/components/mail/MailShell";

export const metadata: Metadata = { title: "임시보관함 - DAYVER 메일" };

export default async function DraftsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mail/drafts");
  const drafts = listDrafts(user.id);
  return (
    <MailShell user={user} current="drafts">
      <h1 className="text-[20px] font-bold mb-3">임시보관함 <span className="text-[13px] text-dv-text-3 font-normal ml-1">전체 {drafts.length}</span></h1>
      <ul className="dv-card divide-y divide-dv-border-2">
        {drafts.length === 0 && <li className="py-20 text-center text-dv-text-3">임시저장한 메일이 없습니다.</li>}
        {drafts.map((d) => (
          <li key={d.id} className="flex items-center gap-3 px-4 py-3 text-[14px] hover:bg-dv-bg-3">
            <form action={deleteDraftAction}>
              <input type="hidden" name="ids" value={d.id} />
              <button type="submit" className="text-[12px] text-dv-text-3 px-2 py-0.5 border border-dv-border rounded bg-white" aria-label="임시메일 삭제">삭제</button>
            </form>
            <span className="w-[200px] dv-ellipsis text-dv-text-2">{d.to_address || <i className="text-dv-text-3">받는사람 없음</i>}</span>
            <Link href={`/mail/write?draft=${d.id}`} className="flex-1 min-w-0 dv-ellipsis">{d.subject || <i className="text-dv-text-3">(제목 없음)</i>}</Link>
            <time className="w-14 text-right text-[12px] text-dv-text-3" dateTime={d.updated_at}>{mailTime(d.updated_at)}</time>
          </li>
        ))}
      </ul>
    </MailShell>
  );
}
