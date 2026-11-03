import type { Metadata } from "next";
import { FolderPage } from "@/components/mail/FolderPage";
import { emptyTrashAction } from "@/lib/actions/mail";

export const metadata: Metadata = { title: "휴지통 - DAYVER 메일" };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <FolderPage
      folder="trash"
      searchParams={searchParams}
      extra={
        <form action={emptyTrashAction} className="mb-3 flex items-center justify-between px-4 py-2.5 rounded bg-dv-bg-2 text-[13px] text-dv-text-2">
          <span>휴지통의 메일은 영구삭제 전까지 복구할 수 있습니다.</span>
          <button type="submit" className="px-3 py-1 border border-dv-border rounded bg-white text-dv-red">휴지통 비우기</button>
        </form>
      }
    />
  );
}
