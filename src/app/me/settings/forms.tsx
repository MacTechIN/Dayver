"use client";

import { useActionState } from "react";
import { changePasswordAction, updatePreferencesAction, updateProfileAction } from "@/lib/actions/me";

const field = "w-full px-3 py-2.5 border border-dv-border rounded-md outline-none focus:border-dv-green text-[14px]";
const COLORS = ["#03c75a", "#2db400", "#5e3bee", "#0068c3", "#ff6f3d", "#e8457b", "#2bb3b1", "#f2a900", "#1f8a70", "#34495e"];

function Msg({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (!state) return null;
  return state.error ? <p role="alert" className="text-dv-red text-[13px]">{state.error}</p> : <p role="status" className="text-dv-green text-[13px]">{state.ok}</p>;
}

export function ProfileForm({ nickname, bio, color, email }: { nickname: string; bio: string; color: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-[13px] font-bold mb-1.5">이메일</label>
        <input value={email} readOnly className={`${field} bg-dv-bg-3 text-dv-text-3`} />
      </div>
      <div>
        <label htmlFor="nickname" className="block text-[13px] font-bold mb-1.5">닉네임</label>
        <input id="nickname" name="nickname" defaultValue={nickname} maxLength={20} required className={field} />
      </div>
      <div>
        <label htmlFor="bio" className="block text-[13px] font-bold mb-1.5">소개</label>
        <textarea id="bio" name="bio" defaultValue={bio} rows={3} maxLength={200} className={field} placeholder="나를 한 줄로 소개해 주세요" />
      </div>
      <fieldset>
        <legend className="block text-[13px] font-bold mb-1.5">프로필 색상</legend>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="avatar_color" value={c} defaultChecked={c === color} className="sr-only peer" aria-label={c} />
              <span className="block w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-dv-text peer-focus-visible:ring-2" style={{ background: c }} />
            </label>
          ))}
        </div>
      </fieldset>
      <Msg state={state} />
      <button type="submit" disabled={pending} className="dv-btn-green px-5 py-2.5 disabled:opacity-60">프로필 저장</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="current" className="block text-[13px] font-bold mb-1.5">현재 비밀번호</label>
        <input id="current" name="current" type="password" autoComplete="current-password" required className={field} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="next" className="block text-[13px] font-bold mb-1.5">새 비밀번호</label>
          <input id="next" name="next" type="password" autoComplete="new-password" required minLength={8} className={field} />
        </div>
        <div>
          <label htmlFor="next2" className="block text-[13px] font-bold mb-1.5">새 비밀번호 확인</label>
          <input id="next2" name="next2" type="password" autoComplete="new-password" required minLength={8} className={field} />
        </div>
      </div>
      <Msg state={state} />
      <button type="submit" disabled={pending} className="px-5 py-2.5 rounded-md border border-dv-border font-bold disabled:opacity-60">비밀번호 변경</button>
    </form>
  );
}

export function PreferencesForm({ newsstandView }: { newsstandView: string }) {
  const [state, action, pending] = useActionState(updatePreferencesAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <fieldset>
        <legend className="block text-[13px] font-bold mb-1.5">뉴스스탠드 기본 보기</legend>
        <div className="flex gap-4 text-[14px]">
          <label className="flex items-center gap-2"><input type="radio" name="newsstand_view" value="thumbnail" defaultChecked={newsstandView === "thumbnail"} /> 썸네일형</label>
          <label className="flex items-center gap-2"><input type="radio" name="newsstand_view" value="list" defaultChecked={newsstandView === "list"} /> 리스트형</label>
        </div>
      </fieldset>
      <Msg state={state} />
      <button type="submit" disabled={pending} className="px-5 py-2.5 rounded-md border border-dv-border font-bold disabled:opacity-60">설정 저장</button>
    </form>
  );
}
