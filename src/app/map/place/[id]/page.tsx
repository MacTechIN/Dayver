import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/common/TopBar";
import { MapView } from "@/components/map/MapView";
import { getPlace, listPlaces, listReviews } from "@/lib/map";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPlace(Number((await params).id));
  return { title: p ? `${p.name} - DAYVER 지도` : "DAYVER 지도" };
}

export default async function PlacePage({ params }: Props) {
  const id = Number((await params).id);
  const place = Number.isFinite(id) ? getPlace(id) : undefined;
  if (!place) notFound();
  const nearby = listPlaces({ category: place.category, limit: 60 });
  const places = nearby.some((p) => p.id === place.id) ? nearby : [place, ...nearby];
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <TopBar service="지도" serviceHref="/map" serviceColor="#03c75a" />
      <main id="content"><MapView places={places} initialSelected={place} reviews={listReviews(place.id)} category={place.category} /></main>
    </>
  );
}
