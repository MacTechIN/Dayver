import type { Metadata } from "next";
import { Footer } from "@/components/common/Footer";
import { StockHeader, StockTable } from "@/components/stock/StockParts";
import { searchStocks } from "@/lib/stock";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = String((await searchParams).query ?? "");
  return { title: q ? `${q} 검색 - DAYVER 증권` : "종목 검색 - DAYVER 증권" };
}

export default async function StockSearchPage({ searchParams }: Props) {
  const q = String((await searchParams).query ?? "").trim();
  const items = q ? searchStocks(q) : [];
  return (
    <>
      <StockHeader active="search" />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5">
          <section aria-label="종목 검색 결과" className="dv-card p-5">
            <h1 className="text-[20px] font-black mb-3">&lsquo;{q}&rsquo; 종목 검색 결과 <span className="text-[13px] text-dv-text-3 font-normal">{items.length}건</span></h1>
            <StockTable items={items} caption="검색 결과" />
          </section>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
