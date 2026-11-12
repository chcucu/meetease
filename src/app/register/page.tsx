import { AuthLayout } from "@/components/auth-layout";
import { RegisterForm } from "@/components/register-form";

export const metadata = { title: "创建账号" };

export default function RegisterPage() {
  return (
    <AuthLayout
      asideLabel="NEW MEMBER / 03"
      asideTitle={
        <>
          下一次，
          <br />
          别再说
          <span className="serif-italic text-acid">「都行」</span>。
        </>
      }
      asideBody="做一个明确的组织者。把选项摆出来，把链接发出去，让每个人的偏好都被看见。"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
