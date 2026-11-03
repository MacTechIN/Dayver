import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CafeSiteShell } from "@/components/cafe/CafeSiteShell";
import { CafeInfoForm } from "@/components/cafe/CafeForms";
import { loadCafeContext } from "@/components/cafe/context";
import { canManage, listCafePosts, listJoinRequests, listMembers } from "@/lib/cafe";
import { addBoardAction, changeRoleAction, deleteBoardAction, deleteCafeAction, deletePostAction, kickMemberAction, moveBoardAction, renameBoardAction, reviewJoinRequestAction } from "@/lib/actions/cafe";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: "카페 관리 - DAYVER 카페" };

const TABS = [
  { key: "info", label: "카페 정보" },
  { key: "boards", label: "게시판 관리" },
  { key: "members", label: "멤버 관리" },
  { key: "requests", label: "가입 신청" },
  { key: "posts", label: "글 관리" },
] as const;

export default async function ManagePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const tab = (TABS.find((t) => t.key === sp.tab)?.key ?? "info") as (typeof TABS)[number]["key"];
  const ctx = await loadCafeContext(slug);
  const { cafe, boards, role, user, pending } = ctx;
  if (!user) redirect(`/login?next=${encodeURIComponent(`/cafe/${slug}/manage`)}`);
  if (!canManage(role)) redirect(`/cafe/${slug}`);
  const isOwner = role === "owner";
  const requests = listJoinRequests(cafe.id);
  const members = tab === "members" ? listMembers(cafe.id) : [];
  const posts = tab === "posts" ? listCafePosts(cafe.id, { size: 50 }).posts : [];
  const hidden = <input type="hidden" name="slug" value={slug} />;
  const small = "px-2.5 py-1 border border-dv-border rounded text-[12px] bg-white";
  return (
    <CafeSiteShell cafe={cafe} boards={boards} role={role} pendingRequest={pending} loggedIn currentBoardId="manage">
      <h2 className="text-[18px] font-bold mb-3">카페 관리</h2>
      <div role="tablist" className="flex border-b border-dv-border mb-5 text-[14px]">
        {TABS.map((t) => (
          <Link key={t.key} href={`/cafe/${slug}/manage?tab=${t.key}`} role="tab" aria-selected={tab === t.key} className={`px-4 py-2.5 -mb-px border-b-2 ${tab === t.key ? "border-dv-text font-bold" : "border-transparent text-dv-text-3"}`}>
            {t.label}{t.key === "requests" && requests.length > 0 && <span className="ml-1 text-[11px] bg-dv-red text-white rounded-full px-1.5">{requests.length}</span>}
          </Link>
        ))}
      </div>

      {tab === "info" && (
        <div className="max-w-[640px]">
          <CafeInfoForm cafe={{ slug: cafe.slug, name: cafe.name, description: cafe.description, category: cafe.category, region: cafe.region, is_public: cafe.is_public, color: cafe.color }} />
          {isOwner && (
            <section aria-label="카페 삭제" className="mt-10 p-4 border border-red-200 rounded-md bg-red-50">
              <h3 className="font-bold text-dv-red mb-1">카페 삭제</h3>
              <p className="text-[12px] text-dv-text-2 mb-3">모든 게시판, 글, 댓글, 멤버 정보가 함께 삭제되며 되돌릴 수 없습니다.</p>
              <form action={deleteCafeAction}>
                {hidden}
                <button type="submit" className="px-4 py-2 rounded bg-dv-red text-white text-[13px] font-bold">카페 삭제</button>
              </form>
            </section>
          )}
        </div>
      )}

      {tab === "boards" && (
        <section aria-label="게시판 관리">
          <ul className="dv-card divide-y divide-dv-border-2">
            {boards.map((b, i) => (
              <li key={b.id} className="p-3 flex items-center gap-2 text-[13px]">
                <form action={renameBoardAction} className="flex items-center gap-2 flex-1">
                  {hidden}
                  <input type="hidden" name="board_id" value={b.id} />
                  <input name="name" defaultValue={b.name} aria-label="게시판 이름" className="px-2 py-1 border border-dv-border rounded w-[200px]" />
                  <label className="flex items-center gap-1 text-[12px]"><input type="checkbox" name="members_only" defaultChecked={!!b.members_only} /> 멤버 전용</label>
                  <span className="text-dv-text-3">글 {b.post_count}</span>
                  <button type="submit" className={small}>저장</button>
                </form>
                <form action={moveBoardAction}>{hidden}<input type="hidden" name="board_id" value={b.id} /><input type="hidden" name="dir" value="up" /><button type="submit" disabled={i === 0} className={`${small} disabled:opacity-30`} aria-label="위로">↑</button></form>
                <form action={moveBoardAction}>{hidden}<input type="hidden" name="board_id" value={b.id} /><input type="hidden" name="dir" value="down" /><button type="submit" disabled={i === boards.length - 1} className={`${small} disabled:opacity-30`} aria-label="아래로">↓</button></form>
                <form action={deleteBoardAction}>{hidden}<input type="hidden" name="board_id" value={b.id} /><button type="submit" disabled={boards.length <= 1} className={`${small} text-dv-red disabled:opacity-30`}>삭제</button></form>
              </li>
            ))}
          </ul>
          <form action={addBoardAction} className="mt-4 flex items-center gap-2 text-[13px]">
            {hidden}
            <input name="name" placeholder="새 게시판 이름" required maxLength={20} className="px-3 py-2 border border-dv-border rounded w-[240px]" aria-label="새 게시판 이름" />
            <label className="flex items-center gap-1 text-[12px]"><input type="checkbox" name="members_only" /> 멤버 전용</label>
            <button type="submit" className="dv-btn-green px-4 py-2">게시판 추가</button>
          </form>
        </section>
      )}

      {tab === "members" && (
        <section aria-label="멤버 관리">
          <table className="w-full text-[13px]">
            <thead className="bg-dv-bg-3 text-dv-text-2 border-y border-dv-border">
              <tr><th className="py-2 text-left pl-3 font-normal">멤버</th><th className="font-normal">등급</th><th className="font-normal">글</th><th className="font-normal">가입일</th><th className="font-normal">관리</th></tr>
            </thead>
            <tbody className="divide-y divide-dv-border-2">
              {members.map((m) => (
                <tr key={m.user_id}>
                  <td className="py-2.5 pl-3"><b>{m.nickname}</b> <span className="text-dv-text-3">@{m.username}</span></td>
                  <td className="text-center">
                    {m.role === "owner" ? "매니저" : isOwner ? (
                      <form action={changeRoleAction} className="inline-flex items-center gap-1">
                        {hidden}<input type="hidden" name="user_id" value={m.user_id} />
                        <select name="role" defaultValue={m.role} className="border border-dv-border rounded px-1 py-0.5" aria-label="등급"><option value="staff">스태프</option><option value="member">멤버</option></select>
                        <button type="submit" className={small}>변경</button>
                      </form>
                    ) : (m.role === "staff" ? "스태프" : "멤버")}
                  </td>
                  <td className="text-center text-dv-text-3">{m.post_count}</td>
                  <td className="text-center text-dv-text-3">{m.joined_at.slice(0, 10)}</td>
                  <td className="text-center">
                    {m.role !== "owner" && (isOwner || m.role === "member") && (
                      <form action={kickMemberAction}>{hidden}<input type="hidden" name="user_id" value={m.user_id} /><button type="submit" className={`${small} text-dv-red`}>강제 탈퇴</button></form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "requests" && (
        <section aria-label="가입 신청">
          <ul className="dv-card divide-y divide-dv-border-2">
            {requests.map((r) => (
              <li key={r.id} className="p-4 flex items-center gap-3 text-[13px]">
                <div className="flex-1">
                  <b>{r.nickname}</b> <span className="text-dv-text-3">@{r.username} · {r.created_at.slice(0, 16)}</span>
                  <p className="text-dv-text-2 mt-1">{r.message || "(인사말 없음)"}</p>
                </div>
                <form action={reviewJoinRequestAction}>{hidden}<input type="hidden" name="request_id" value={r.id} /><input type="hidden" name="decision" value="approved" /><button type="submit" className="dv-btn-green px-3 py-1.5 text-[12px]">승인</button></form>
                <form action={reviewJoinRequestAction}>{hidden}<input type="hidden" name="request_id" value={r.id} /><input type="hidden" name="decision" value="rejected" /><button type="submit" className={`${small} text-dv-red`}>거절</button></form>
              </li>
            ))}
            {requests.length === 0 && <li className="p-8 text-center text-dv-text-3">대기 중인 가입 신청이 없습니다.{cafe.is_public ? " (공개 카페는 바로 가입됩니다)" : ""}</li>}
          </ul>
        </section>
      )}

      {tab === "posts" && (
        <section aria-label="글 관리">
          <table className="w-full text-[13px]">
            <thead className="bg-dv-bg-3 text-dv-text-2 border-y border-dv-border">
              <tr><th className="py-2 text-left pl-3 font-normal">제목</th><th className="font-normal">게시판</th><th className="font-normal">작성자</th><th className="font-normal">작성일</th><th className="font-normal">관리</th></tr>
            </thead>
            <tbody className="divide-y divide-dv-border-2">
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pl-3"><Link href={`/cafe/${slug}/post/${p.id}`} className="hover:underline">{p.is_notice ? <b className="text-dv-red mr-1">공지</b> : null}{p.title}</Link></td>
                  <td className="text-center text-dv-text-3">{p.board_name}</td>
                  <td className="text-center">{p.author}</td>
                  <td className="text-center text-dv-text-3">{p.created_at.slice(0, 10)}</td>
                  <td className="text-center">
                    <form action={deletePostAction}>{hidden}<input type="hidden" name="post_id" value={p.id} /><input type="hidden" name="back" value={`/cafe/${slug}/manage?tab=posts`} /><button type="submit" className={`${small} text-dv-red`}>삭제</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </CafeSiteShell>
  );
}
