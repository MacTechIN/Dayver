"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { BlogFormState } from "@/lib/actions/blog";

type Props = {
  action: (prev: BlogFormState, form: FormData) => Promise<BlogFormState>;
  categories: readonly string[];
  initial?: { id?: number; title?: string; content?: string; category?: string; tags?: string; is_public?: number };
  submitLabel?: string;
};

/** 글쓰기/수정 폼: 제목, 주제, 태그, 본문(줄바꿈 유지), 공개 설정 */
export function PostForm({ action, categories, initial = {}, submitLabel = "발행" }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="dv-card p-8 space-y-5">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div>
        <label htmlFor="title" className="sr-only">제목</label>
        <input id="title" name="title" defaultValue={initial.title} placeholder="제목" maxLength={100} required className="w-full text-[28px] font-bold outline-none placeholder:text-dv-text-3 border-b border-dv-border pb-3" />
      </div>
      <div className="flex gap-3 text-[13px]">
        <label className="flex items-center gap-2">
          주제
          <select name="category" defaultValue={initial.category ?? "일상·생각"} className="border border-dv-border rounded px-2 py-1.5">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 flex-1">
          태그
          <input name="tags" defaultValue={initial.tags} placeholder="쉼표로 구분 (최대 10개)" className="flex-1 border border-dv-border rounded px-2 py-1.5" />
        </label>
        <label className="flex items-center gap-2">
          공개
          <select name="is_public" defaultValue={String(initial.is_public ?? 1)} className="border border-dv-border rounded px-2 py-1.5">
            <option value="1">전체공개</option>
            <option value="0">비공개</option>
          </select>
        </label>
      </div>
      <div>
        <label htmlFor="content" className="sr-only">본문</label>
        <textarea id="content" name="content" defaultValue={initial.content} placeholder="내용을 입력하세요. 빈 줄로 문단을 나눌 수 있습니다." rows={18} required className="w-full outline-none text-[15px] leading-relaxed resize-y border border-dv-border-2 rounded p-4 focus:border-dv-green" />
      </div>
      {state?.error && <p role="alert" className="text-dv-red text-[13px]">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <Link href="/blog" className="px-5 py-2.5 border border-dv-border rounded text-[14px]">취소</Link>
        <button type="submit" disabled={pending} className="dv-btn-green px-6 py-2.5 text-[14px] disabled:opacity-60">{pending ? "저장 중…" : submitLabel}</button>
      </div>
    </form>
  );
}
