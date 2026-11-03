import type { Metadata } from "next";
import { TopBar } from "@/components/common/TopBar";
import { MapView } from "@/components/map/MapView";
import { MAP_CATEGORIES, listPlaces } from "@/lib/map";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = String(sp.query ?? sp.category ?? "");
  return { title: q ? `${q} - DAYVER 지도` : "DAYVER 지도" };
}

export default async function MapSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = typeof sp.query === "string" ? sp.query.trim() : "";
  const category = typeof sp.category === "string" && (MAP_CATEGORIES as readonly string[]).includes(sp.category) ? sp.category : undefined;
  const places = listPlaces({ query: query || undefined, category, limit: 60 });
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <TopBar service="지도" serviceHref="/map" serviceColor="#03c75a" />
      <main id="content"><MapView places={places} query={query} category={category} /></main>
    </>
  );
}
