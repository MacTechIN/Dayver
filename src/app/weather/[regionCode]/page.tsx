import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/common/Footer";
import { WeatherHeader } from "@/components/weather/WeatherHeader";
import { HourlyStrip, LifeIndexes, NowCard, RegionList, RegionPicker, WeeklyTable } from "@/components/weather/WeatherParts";
import { getForecast, listRegions } from "@/lib/weather";
import { listArticlesBySection } from "@/lib/news";

type Props = { params: Promise<{ regionCode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = getForecast((await params).regionCode);
  return { title: f ? `${f.region.name} 날씨 - DAYVER 날씨` : "DAYVER 날씨" };
}

export default async function RegionWeatherPage({ params }: Props) {
  const { regionCode } = await params;
  const f = getForecast(regionCode);
  if (!f) notFound();
  const regions = listRegions();
  const news = listArticlesBySection("생활/문화", 5);
  return (
    <>
      <WeatherHeader active="home" />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5 grid grid-cols-[1fr_320px] gap-5">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-[22px] font-black">{f.region.name} <span className="text-[13px] font-normal text-dv-text-3">오늘 날씨</span></h1>
              <RegionPicker regions={regions} current={f.region.code} />
            </div>
            <NowCard f={f} />
            <HourlyStrip f={f} />
            <WeeklyTable f={f} />
            <LifeIndexes f={f} />
          </div>
          <aside className="min-w-0">
            <RegionList regions={regions} current={f.region.code} />
            <section aria-label="날씨 뉴스" className="dv-card p-4 mt-4">
              <h2 className="font-bold text-[14px] mb-2">생활·날씨 뉴스</h2>
              <ul className="text-[13px] space-y-1.5">
                {news.map((a) => <li key={a.id} className="dv-ellipsis"><Link href={`/news/article/${a.id}`} data-clk="weather.news.title">{a.title}</Link></li>)}
              </ul>
            </section>
            <p className="text-[12px] text-dv-text-3 mt-3 px-1">예보 값은 학습용 가상 데이터입니다. 기상청 자료가 아닙니다.</p>
          </aside>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
