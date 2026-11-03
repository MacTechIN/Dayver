"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, undefined);
  const field = "w-full px-4 py-3 border border-dv-border rounded-md outline-none focus:border-dv-green";
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-[13px] font-bold mb-1.5">아이디</label>
        <div className="flex items-center gap-2">
          <input id="username" name="username" placeholder="영문 소문자, 숫자, _ (4~20자)" className={field} required />
          <span className="text-dv-text-3 text-[13px] whitespace-nowrap">@dayver.com</span>
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-[13px] font-bold mb-1.5">비밀번호</label>
        <input id="password" name="password" type="password" placeholder="8자 이상" className={field} required />
      </div>
      <div>
        <label htmlFor="password2" className="block text-[13px] font-bold mb-1.5">비밀번호 재확인</label>
        <input id="password2" name="password2" type="password" className={field} required />
      </div>
      <div>
        <label htmlFor="nickname" className="block text-[13px] font-bold mb-1.5">닉네임</label>
        <input id="nickname" name="nickname" placeholder="서비스에서 표시될 이름" className={field} required />
      </div>
      <ul className="text-[12px] text-dv-text-2 space-y-1 p-3 bg-dv-bg-2 rounded">
        <li><label className="flex gap-2"><input type="checkbox" required /> [필수] Dayver 이용약관 동의</label></li>
        <li><label className="flex gap-2"><input type="checkbox" required /> [필수] 개인정보 수집 및 이용 동의</label></li>
        <li><label className="flex gap-2"><input type="checkbox" /> [선택] 이벤트·혜택 정보 수신 동의</label></li>
      </ul>
      {state?.error && <p role="alert" className="text-dv-red text-[13px]">{state.error}</p>}
      <button type="submit" disabled={pending} className="dv-btn-green w-full py-3.5 text-[16px] disabled:opacity-60">
        {pending ? "가입 중…" : "가입하기"}
      </button>
    </form>
  );
}
