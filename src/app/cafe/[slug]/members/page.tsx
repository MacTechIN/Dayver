import type { Metadata } from "next";
import { CafeSiteShell } from "@/components/cafe/CafeSiteShell";
import { loadCafeContext } from "@/components/cafe/context";
import { listMembers } from "@/lib/cafe";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "멤버 - DAYVER 카페" };

const ROLE_LABEL = { owner: "매니저", staff: "스태프", member: "멤버" } as const;

export default async function MembersPage({ params }: Props) {
  const { slug } = await params;
  const ctx = await loadCafeContext(slug);
  const { cafe, boards, role, user, pending } = ctx;
  const members = listMembers(cafe.id);
  return (
    <CafeSiteShell cafe={cafe} boards={boards} role={role} pendingRequest={pending} loggedIn={!!user} currentBoardId="members">
      <h2 className="text-[18px] font-bold mb-4">멤버 <span className="text-dv-text-3 text-[13px] font-normal">{members.length}</span></h2>
      <table className="w-full text-[13px]">
        <thead className="bg-dv-bg-3 text-dv-text-2 border-y border-dv-border">
          <tr><th className="py-2 text-left pl-3 font-normal">닉네임</th><th className="font-normal">등급</th><th className="font-normal">작성 글</th><th className="font-normal">가입일</th></tr>
        </thead>
        <tbody className="divide-y divide-dv-border-2">
          {members.map((m) => (
            <tr key={m.user_id}>
              <td className="py-2.5 pl-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full text-white grid place-items-center text-[12px] font-bold" style={{ background: m.avatar_color }} aria-hidden>{m.nickname.slice(0, 1)}</span>
                <span><b>{m.nickname}</b> <span className="text-dv-text-3">@{m.username}</span></span>
              </td>
              <td className="text-center">{ROLE_LABEL[m.role]}</td>
              <td className="text-center text-dv-text-3">{m.post_count}</td>
              <td className="text-center text-dv-text-3">{m.joined_at.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CafeSiteShell>
  );
}
