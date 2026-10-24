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

      toast.success("Report submitted successfully", {
        description: "Thank you for helping keep our community safe. Our team will review it.",
      });
      setReason("");
      onClose();
    } catch (err: any) {
      const errorMsg =
        err.message ||
        "Failed to submit report. You might have already reported this item.";
      setError(errorMsg);
      toast.error("Submission failed", { description: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabels = {
    POST: "Post",
    SUPPORT_REQUEST: "Support Request",
    USER: "User",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <Flag className="size-5" />
            Report {typeLabels[targetType]}
          </DialogTitle>
          <DialogDescription>
            You are reporting {title ? (
              <span className="font-semibold text-foreground">"{title}"</span>
            ) : (
              `this ${typeLabels[targetType].toLowerCase()}`
            )}. Our moderation team will review it carefully.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="report-reason" className="text-foreground">
              Reason for reporting <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="report-reason"
              required
              maxLength={1000}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              placeholder="Please provide specific details about why this violates our community guidelines..."
              className="resize-none"
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || !reason.trim()}
              className="gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
