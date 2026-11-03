"use client";

import { useActionState } from "react";
import { createCafeAction, createPostAction, updateCafeAction, updatePostAction, type CafeActionState } from "@/lib/actions/cafe";
import { CAFE_CATEGORIES, CAFE_COLORS } from "./constants";

const field = "w-full px-3 py-2.5 border border-dv-border rounded-md outline-none focus:border-dv-green bg-white";
const label = "block text-[13px] font-bold mb-1.5";

type CafeInfo = { slug: string; name: string; description: string; category: string; region: string | null; is_public: number; color: string };

/** 카페 만들기 / 정보 수정 폼 */
export function CafeInfoForm({ cafe }: { cafe?: CafeInfo }) {
  const [state, action, pending] = useActionState<CafeActionState, FormData>(cafe ? updateCafeAction : createCafeAction, undefined);
  return (
    <form action={action} className="space-y-4">
      {cafe && <input type="hidden" name="slug" value={cafe.slug} />}
      <div>
        <label htmlFor="name" className={label}>카페 이름</label>
        <input id="name" name="name" defaultValue={cafe?.name} placeholder="예) 캠핑 라이프" className={field} required maxLength={40} />
      </div>
      {!cafe && (
        <div>
          <label htmlFor="slug" className={label}>카페 주소</label>
          <div className="flex items-center gap-2">
            <span className="text-dv-text-3 text-[13px]">dayver.com/cafe/</span>
            <input id="slug" name="slug" placeholder="영문 소문자, 숫자, - (3~30자)" className={field} required pattern="[a-z0-9-]{3,30}" />
          </div>
        </div>
      )}
      <div>
        <label htmlFor="category" className={label}>주제</label>
        <select id="category" name="category" defaultValue={cafe?.category ?? ""} className={field} required>
          <option value="" disabled>주제를 선택하세요</option>
          {CAFE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="description" className={label}>카페 소개</label>
        <textarea id="description" name="description" defaultValue={cafe?.description} rows={3} className={field} placeholder="카페를 한 줄로 소개해 주세요" />
      </div>
      <div>
        <label htmlFor="region" className={label}>지역 (선택)</label>
        <input id="region" name="region" defaultValue={cafe?.region ?? ""} placeholder="예) 고양시 덕양구" className={field} />
      </div>
      <div>
        <span className={label}>대표 색상</span>
        <div className="flex gap-2">
          {CAFE_COLORS.map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="color" value={c} defaultChecked={cafe ? cafe.color === c : i === 0} className="sr-only peer" />
              <span className="block w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-dv-text" style={{ background: c }} aria-label={c} />
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" name="is_public" defaultChecked={cafe ? !!cafe.is_public : true} /> 공개 카페 (누구나 바로 가입) — 해제하면 가입 신청 후 승인제
      </label>
      {state?.error && <p role="alert" className="text-dv-red text-[13px]">{state.error}</p>}
      {state?.ok && <p role="status" className="text-dv-green text-[13px]">저장되었습니다.</p>}
      <button type="submit" disabled={pending} className="dv-btn-green px-6 py-3 text-[15px] disabled:opacity-60">
        {pending ? "저장 중…" : cafe ? "정보 저장" : "카페 만들기"}
      </button>
    </form>
  );
}

type BoardOpt = { id: number; name: string };
type PostInit = { id: number; title: string; content: string; board_id: number };

/** 글쓰기 / 글수정 폼 */
export function PostForm({ slug, boards, canNotice, post, defaultBoardId }: { slug: string; boards: BoardOpt[]; canNotice: boolean; post?: PostInit; defaultBoardId?: number }) {
  const [state, action, pending] = useActionState<CafeActionState, FormData>(post ? updatePostAction : createPostAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      {post && <input type="hidden" name="post_id" value={post.id} />}
      <div className="flex gap-3">
        <select name="board_id" defaultValue={post?.board_id ?? defaultBoardId ?? boards[0]?.id} className={`${field} w-[200px]`} aria-label="게시판 선택">
          {boards.map((b) => <option key={b.id} value={b.id} disabled={b.name === "공지사항" && !canNotice}>{b.name}</option>)}
        </select>
        <input name="title" defaultValue={post?.title} placeholder="제목을 입력해 주세요." className={field} required maxLength={100} aria-label="제목" />
      </div>
      <textarea name="content" defaultValue={post?.content} rows={16} className={field} placeholder="내용을 입력해 주세요." required aria-label="내용" />
      {canNotice && !post && <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="is_notice" /> 공지로 등록 (공지사항 게시판 선택 시)</label>}
      {state?.error && <p role="alert" className="text-dv-red text-[13px]">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <a href={post ? `/cafe/${slug}/post/${post.id}` : `/cafe/${slug}`} className="px-5 py-2.5 border border-dv-border rounded-md text-[14px]">취소</a>
        <button type="submit" disabled={pending} className="dv-btn-green px-6 py-2.5 text-[14px] disabled:opacity-60">{pending ? "저장 중…" : "등록"}</button>
      </div>
    </form>
  );
}
