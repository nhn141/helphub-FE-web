"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createReport } from "@/lib/api";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "POST" | "SUPPORT_REQUEST" | "USER";
  title?: string;
}

export function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  title,
}: ReportModalProps) {
  const { getAccessToken } = useAuth();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getAccessToken();
      await createReport(token, {
        targetType,
        targetId,
        reason: reason.trim(),
      });

      toast.success("Báo cáo vi phạm đã được gửi thành công", {
        description: "Cảm ơn bạn đã chung tay bảo vệ môi trường cộng đồng văn minh, an toàn.",
      });
      setReason("");
      onClose();
    } catch (err: any) {
      const errorMsg =
        err.message ||
        "Gửi báo cáo thất bại. Có thể bạn đã báo cáo nội dung này trước đó.";
      setError(errorMsg);
      toast.error("Không thể gửi báo cáo", { description: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabels = {
    POST: "bài viết",
    SUPPORT_REQUEST: "yêu cầu hỗ trợ",
    USER: "người dùng",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <Flag className="size-5" />
            Báo cáo {typeLabels[targetType]}
          </DialogTitle>
          <DialogDescription>
            Bạn đang báo cáo {title ? (
              <span className="font-bold text-foreground">"{title}"</span>
            ) : (
              `nội dung ${typeLabels[targetType]}`
            )}. Đội ngũ kiểm duyệt sẽ tiếp nhận và xử lý theo đúng quy định.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="report-reason" className="text-foreground font-bold">
              Lý do báo cáo vi phạm <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="report-reason"
              required
              maxLength={1000}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              placeholder="Vui lòng cung cấp chi tiết vi phạm (ví dụ: thông tin sai sự thật, xúc phạm, trục lợi từ thiện...)"
              className="resize-none rounded-xl"
            />
            <p className="text-xs text-muted-foreground text-right">
              {reason.length}/1000
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl font-bold"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || !reason.trim()}
              className="gap-2 font-black rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi báo cáo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
