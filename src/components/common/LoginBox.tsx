import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { logoutAction } from "@/lib/actions/auth";

/**
 * 우측 로그인 박스 (네이버 메인 '로그인 정보' region 재해석).
 * 비로그인: 초록 CTA + 아이디/비밀번호 찾기/회원가입. 로그인: 메일/카페/블로그 요약.
 */
export async function LoginBox({ next = "/" }: { next?: string }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <section aria-label="로그인 정보" className="dv-card p-6 text-center">
        <p className="text-[13px] text-dv-text-2 mb-4">데이버를 더 안전하고 편리하게 이용하세요</p>
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="dv-btn-green block w-full py-3.5 text-[16px]">
          DAYVER 로그인
        </Link>
        <ul className="flex justify-center gap-3 mt-4 text-[12px] text-dv-text-3">
          <li><Link href="/login">아이디 찾기</Link></li>
          <li aria-hidden>|</li>
          <li><Link href="/login">비밀번호 찾기</Link></li>
          <li aria-hidden>|</li>
          <li><Link href="/signup" className="text-dv-text-2 font-bold">회원가입</Link></li>
        </ul>
      </section>
    );
  }
  const mail = get<{ c: number }>("SELECT COUNT(*) c FROM mails WHERE to_user_id = ? AND read_at IS NULL AND deleted_by_receiver = 0", user.id);
  const cafes = get<{ c: number }>("SELECT COUNT(*) c FROM cafe_members WHERE user_id = ?", user.id);
  const posts = get<{ c: number }>("SELECT COUNT(*) c FROM blog_posts WHERE user_id = ?", user.id);
  const noti = get<{ c: number }>("SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND read_at IS NULL", user.id);
  return (
    <section aria-label="로그인 정보" className="dv-card p-5">
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-full grid place-items-center text-white font-black text-lg" style={{ background: user.avatar_color }} aria-hidden>
          {user.nickname.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <div className="font-bold text-[15px] dv-ellipsis">{user.nickname}</div>
          <div className="text-[12px] text-dv-text-3 dv-ellipsis">{user.email}</div>
        </div>
        <form action={logoutAction} className="ml-auto">
          <button type="submit" className="text-[12px] px-2 py-1 border border-dv-border rounded">로그아웃</button>
        </form>
      </div>
      <ul className="grid grid-cols-4 gap-1 mt-4 text-center text-[12px]">
        <li><Link href="/mail" className="block py-2 rounded hover:bg-dv-bg-2"><b className="block text-[16px] text-dv-green">{mail?.c ?? 0}</b>메일</Link></li>
        <li><Link href="/cafe" className="block py-2 rounded hover:bg-dv-bg-2"><b className="block text-[16px]">{cafes?.c ?? 0}</b>카페</Link></li>
        <li><Link href="/blog/my" className="block py-2 rounded hover:bg-dv-bg-2"><b className="block text-[16px]">{posts?.c ?? 0}</b>블로그</Link></li>
        <li><Link href="/me" className="block py-2 rounded hover:bg-dv-bg-2"><b className="block text-[16px] text-dv-red">{noti?.c ?? 0}</b>알림</Link></li>
      </ul>
    </section>
  );
}
