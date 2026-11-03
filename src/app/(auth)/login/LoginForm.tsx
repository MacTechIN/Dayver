"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/lib/actions/auth";

/** 네이버 로그인 폼 재해석: 아이디/비밀번호, 로그인 상태 유지, IP 보안 스위치 */
export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const [ipSecure, setIpSecure] = useState(true);
  return (
    <form id="login-form" action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <ul className="border border-dv-border rounded-md divide-y divide-dv-border">
        <li>
          <label className="sr-only" htmlFor="username">아이디 또는 전화번호</label>
          <input id="username" name="username" autoComplete="username" placeholder="아이디 또는 전화번호" className="w-full px-4 py-3.5 outline-none focus:bg-dv-bg-3" />
        </li>
        <li>
          <label className="sr-only" htmlFor="password">비밀번호</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="비밀번호" className="w-full px-4 py-3.5 outline-none focus:bg-dv-bg-3" />
        </li>
      </ul>
      <div className="flex items-center justify-between text-[13px] text-dv-text-2 py-1">
        <label className="flex items-center gap-2"><input type="checkbox" name="keep" defaultChecked /> 로그인 상태 유지</label>
        <button type="button" role="switch" aria-checked={ipSecure} onClick={() => setIpSecure((v) => !v)} className="flex items-center gap-2">
          IP보안 <span className={`inline-block w-9 h-5 rounded-full relative transition ${ipSecure ? "bg-dv-green" : "bg-dv-border"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${ipSecure ? "left-[18px]" : "left-0.5"}`} /></span>
        </button>
      </div>
      {state?.error && <p role="alert" className="text-dv-red text-[13px]">{state.error}</p>}
      <button type="submit" disabled={pending} className="dv-btn-green w-full py-3.5 text-[16px] disabled:opacity-60">
        {pending ? "로그인 중…" : "로그인"}
      </button>
      <ul className="flex gap-2 pt-2">
        <li className="flex-1"><button type="button" className="w-full py-2.5 border border-dv-border rounded text-[13px]">QR 코드 로그인</button></li>
        <li className="flex-1"><button type="button" className="w-full py-2.5 border border-dv-border rounded text-[13px]">일회용 번호 로그인</button></li>
      </ul>
    </form>
  );
}
