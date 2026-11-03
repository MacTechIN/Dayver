import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/common/Footer";
import { StockHeader, StockTable } from "@/components/stock/StockParts";
import { getCurrentUser } from "@/lib/auth";
import { listWatchlist } from "@/lib/stock";

export const metadata: Metadata = { title: "관심종목 - DAYVER 증권" };

export default async function MyStockPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/stock/my");
  const items = listWatchlist(user.id);
  return (
    <>
      <StockHeader active="my" />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5">
          <section aria-label="관심종목" className="dv-card p-5">
            <h1 className="text-[20px] font-black mb-3">{user.nickname}님의 관심종목 <span className="text-[13px] text-dv-text-3 font-normal">{items.length}개</span></h1>
            <StockTable items={items} caption="관심종목" />
          </section>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
