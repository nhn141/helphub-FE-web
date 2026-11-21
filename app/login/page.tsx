import { Suspense } from "react";
import AuthClient from "../auth-client";

export const metadata = {
  title: "Tài khoản – HelpHub",
  description: "Đăng nhập hoặc tạo tài khoản HelpHub để kết nối với cộng đồng tình nguyện.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthClient />
    </Suspense>
  );
}

