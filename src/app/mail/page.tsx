import type { Metadata } from "next";
import { FolderPage } from "@/components/mail/FolderPage";

export const metadata: Metadata = { title: "받은메일함 - DAYVER 메일" };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <FolderPage folder="inbox" searchParams={searchParams} />;
}
