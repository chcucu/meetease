import { Suspense } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "登录" };

export default function LoginPage() {
  return (
    <AuthLayout
      asideLabel="MEMBER ACCESS / 02"
      asideTitle={
        <>
          一群人，
          <br />
          一个
          <span className="serif-italic text-acid">答案</span>。
        </>
      }
      asideBody="登录之后，你创建过的每一场决定都在工作台里：谁投了什么、谁还没来、谁已经付了钱。"
    >
      <Suspense fallback={<div className="h-[420px] animate-pulse border border-line bg-surface" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
