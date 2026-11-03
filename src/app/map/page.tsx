import type { Metadata } from "next";
import { TopBar } from "@/components/common/TopBar";
import { MapView } from "@/components/map/MapView";
import { listPlaces } from "@/lib/map";

export const metadata: Metadata = { title: "DAYVER 지도" };

export default async function MapPage() {
  const places = listPlaces({ limit: 60 });
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <TopBar service="지도" serviceHref="/map" serviceColor="#03c75a" />
      <main id="content"><MapView places={places} /></main>
    </>
  );
}
