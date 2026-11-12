import { AuthLayout } from "@/components/auth-layout";
import { RegisterForm } from "@/components/register-form";

export const metadata = { title: "创建账号" };

export default function RegisterPage() {
  return (
    <AuthLayout
      asideTitle={
        <>
          从一次<span className="text-acid">决策</span>，
          <br />
          开始。
        </>
      }
      asideBody="创建组织者账号，用于创建决策页、分享链接并管理结果。参与者无需注册。"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
