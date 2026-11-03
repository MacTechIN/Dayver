import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DayverLogo } from "@/components/common/DayverLogo";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "DAYVER 회원가입" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <main className="min-h-screen bg-white">
      <div className="w-[520px] mx-auto pt-14 pb-20">
        <header className="text-center mb-8">
          <h1><DayverLogo size={40} /></h1>
          <p className="mt-3 text-[15px] font-bold">회원가입</p>
        </header>
        <SignupForm />
        <p className="mt-6 text-center text-[13px] text-dv-text-3">
          이미 계정이 있으신가요? <Link href="/login" className="text-dv-green font-bold">로그인</Link>
        </p>
      </div>
    </main>
  );
}
