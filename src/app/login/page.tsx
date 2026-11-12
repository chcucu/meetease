import { Suspense } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "登录" };

export default function LoginPage() {
  return (
    <AuthLayout
      asideTitle={
        <>
          所有决策，
          <br />
          集于<span className="text-[#a9bcff]">一处</span>。
        </>
      }
      asideBody="登录后，你可以查看已创建的决策、参与者、投票与支付状态。"
    >
      <Suspense fallback={<div className="h-[420px] animate-pulse rounded-xl border border-line bg-surface" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
