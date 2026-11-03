import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DayverLogo } from "@/components/common/DayverLogo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "DAYVER 로그인" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";
  if (await getCurrentUser()) redirect(next);
  return (
    <main className="min-h-screen bg-white">
      <a href="#login-form" className="dv-skip">본문 바로가기</a>
      <div className="w-[460px] mx-auto pt-16 pb-20">
        <header className="text-center mb-8">
          <h1><DayverLogo size={40} /></h1>
        </header>
        <LoginForm next={next} />
        <ul className="flex justify-center gap-3 mt-6 text-[13px] text-dv-text-3">
          <li><Link href="/login">아이디 찾기</Link></li>
          <li aria-hidden>|</li>
          <li><Link href="/login">비밀번호 찾기</Link></li>
          <li aria-hidden>|</li>
          <li><Link href="/signup" className="text-dv-text-2">회원가입</Link></li>
        </ul>
        <section aria-label="데모 계정 안내" className="mt-10 p-4 bg-dv-bg-2 rounded text-[12px] text-dv-text-2">
          데모 계정: <b>haru / dayver1234</b> (그 외 dayver, minsu, jiyeon, store_master, newsdesk 도 같은 비밀번호)
        </section>
        <footer role="contentinfo" className="mt-16 text-center text-[12px] text-dv-text-3">
          <Link href="/me">고객센터</Link> · ⓓ DAYVER Corp.
        </footer>
      </div>
    </main>
  );
}
