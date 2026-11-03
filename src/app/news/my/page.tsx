import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Footer } from "@/components/common/Footer";
import { NewsHeader } from "@/components/news/NewsHeader";
import { PressEditionCard, PressLogo, SubscribeButton } from "@/components/news/ArticleParts";
import { listPress, listPressEditions, listSubscribedPress, listSubscribedPressIds, PRESS_CATEGORIES } from "@/lib/news";

export const metadata: Metadata = { title: "MY뉴스 - DAYVER 뉴스" };

export default async function MyNewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/news/my");
  const subs = listSubscribedPressIds(user.id);
  const subscribed = listSubscribedPress(user.id);
  const editions = listPressEditions(subscribed, 4);
  const allPress = listPress({ limit: 100 });
  return (
    <>
      <NewsHeader active="my" />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5 grid grid-cols-[1fr_360px] gap-5">
          <section aria-label="구독한 언론사 편집" className="space-y-4">
            <div className="dv-card px-5 py-4 flex items-center justify-between">
              <h2 className="text-[18px] font-black">{user.nickname}님의 MY뉴스</h2>
              <span className="text-[13px] text-dv-text-2">구독 언론사 <b className="text-dv-blue">{subscribed.length}</b>개</span>
            </div>
            {editions.length === 0 ? (
              <div className="dv-card p-10 text-center text-dv-text-2">
                아직 구독한 언론사가 없습니다. 오른쪽 목록에서 <b>+구독</b>을 눌러 나만의 뉴스 홈을 만들어 보세요.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 items-start">
                {editions.map((e) => <PressEditionCard key={e.press.id} press={e.press} articles={e.articles} subscribed back="/news/my" />)}
              </div>
            )}
          </section>
          <aside aria-label="언론사 구독 설정" className="dv-card p-4 self-start">
            <h2 className="font-bold text-[15px] mb-3">언론사 구독 설정</h2>
            {PRESS_CATEGORIES.filter((c) => c !== "주요언론사").map((cat) => (
              <section key={cat} aria-label={cat} className="mb-4">
                <h3 className="text-[12px] font-bold text-dv-text-3 mb-1">{cat}</h3>
                <ul className="space-y-1.5">
                  {allPress.filter((p) => p.category === cat).map((p) => (
                    <li key={p.id} className="flex items-center justify-between">
                      <Link href={`/news/press/${p.slug}`}><PressLogo press={p} size={16} /></Link>
                      <SubscribeButton pressId={p.id} subscribed={subs.includes(p.id)} back="/news/my" />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </aside>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
