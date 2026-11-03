import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listMails, mailTime, PAGE_SIZE, type MailFolder, FOLDERS } from "@/lib/mail";
import { MailShell } from "./MailShell";
import { MailList } from "./MailList";

/** 폴더 페이지 공통 구현 (받은/보낸/별표/스팸/휴지통). */
export async function FolderPage({ folder, searchParams, extra }: {
  folder: MailFolder;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  extra?: React.ReactNode;
}) {
  const info = FOLDERS.find((f) => f.key === folder)!;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(info.href)}`);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { mails, total } = listMails(folder, user.id, page);
  const timeOf: Record<number, string> = {};
  for (const m of mails) timeOf[m.id] = mailTime(m.created_at);
  return (
    <MailShell user={user} current={folder}>
      {sp.sent === "1" && <p role="status" className="mb-3 px-4 py-2.5 rounded bg-[#e9f9ef] text-dv-green text-[13px] font-bold">메일을 보냈습니다.</p>}
      {extra}
      <MailList folder={folder} mails={mails} userId={user.id} page={page} total={total} pageSize={PAGE_SIZE} returnTo={`${info.href}?page=${page}`} timeOf={timeOf} title={info.name} />
    </MailShell>
  );
}
