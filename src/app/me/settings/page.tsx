import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { readViewSettings } from "@/lib/settings";
import { TopBar } from "@/components/common/TopBar";
import { Footer } from "@/components/common/Footer";
import { ViewSettings } from "@/components/common/ViewSettings";
import { PasswordForm, PreferencesForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "설정 - DAYVER MY" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/me/settings");
  const view = await readViewSettings();
  const prefs = get<{ newsstand_view: string }>("SELECT newsstand_view FROM user_settings WHERE user_id = ?", user.id);
  return (
    <>
      <TopBar service="MY" serviceHref="/me" />
      <main id="content" className="dv-container py-8 grid grid-cols-[220px_1fr] gap-8">
        <nav aria-label="MY 메뉴" className="text-[14px]">
          <ul className="space-y-1">
            <li><Link href="/me" className="block px-3 py-2 rounded hover:bg-dv-bg-2">내 정보</Link></li>
            <li><Link href="/me/notifications" className="block px-3 py-2 rounded hover:bg-dv-bg-2">알림 센터</Link></li>
            <li><Link href="/me/settings" className="block px-3 py-2 rounded bg-dv-bg-2 font-bold">설정</Link></li>
          </ul>
        </nav>
        <div className="space-y-6 max-w-[720px]">
          <h1 className="text-[20px] font-bold">설정</h1>
          <section aria-labelledby="s-view" className="dv-card p-6">
            <h2 id="s-view" className="font-bold text-[16px] mb-1">보기 설정</h2>
            <p className="text-[13px] text-dv-text-3 mb-4">화면 테마와 글꼴 크기는 이 브라우저(쿠키)에 저장되고, 로그인 중에는 계정에도 기록됩니다.</p>
            <ViewSettings theme={view.theme} font={view.font} />
          </section>
          <section aria-labelledby="s-profile" className="dv-card p-6">
            <h2 id="s-profile" className="font-bold text-[16px] mb-4">프로필</h2>
            <ProfileForm nickname={user.nickname} bio={user.bio} color={user.avatar_color} email={user.email} />
          </section>
          <section aria-labelledby="s-pw" className="dv-card p-6">
            <h2 id="s-pw" className="font-bold text-[16px] mb-4">비밀번호 변경</h2>
            <PasswordForm />
          </section>
          <section aria-labelledby="s-pref" className="dv-card p-6">
            <h2 id="s-pref" className="font-bold text-[16px] mb-4">서비스 설정</h2>
            <PreferencesForm newsstandView={prefs?.newsstand_view ?? "thumbnail"} />
          </section>
        </div>
      </main>
      <Footer compact />
    </>
  );
}
