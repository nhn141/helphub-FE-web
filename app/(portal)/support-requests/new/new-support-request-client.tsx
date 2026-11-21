"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { SupportRequestForm } from "@/components/support-request-form";
import { Notice, PageHeading } from "@/components/support-ui";
import {
  createSupportRequest,
  type SupportRequestPayload,
} from "@/lib/api";

export default function NewSupportRequestClient() {
  const router = useRouter();
  const { profile, getAccessToken } = useAuth();

  if (profile.role !== "REQUESTER") {
    return (
      <Notice type="error">
        Chỉ tài khoản người cần hỗ trợ (Requester) mới có thể tạo yêu cầu hỗ trợ.
      </Notice>
    );
  }

  async function handleSubmit(payload: SupportRequestPayload) {
    const token = await getAccessToken();
    const created = await createSupportRequest(token, payload);
    router.push(`/support-requests/${created.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeading
        eyebrow="Bước 1"
        title="Tạo yêu cầu hỗ trợ"
        description="Bắt đầu với thông tin tổng quan của đợt hỗ trợ. Sau khi tạo thành công, bạn có thể bổ sung danh sách các nhu cầu cụ thể như tiền mặt, lương thực hoặc vật tư y tế."
      />
      <SupportRequestForm
        submitLabel="Tạo yêu cầu"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/support-requests")}
      />
    </div>
  );
}
