"use client";

import { useState, useEffect } from "react";
import { Report } from "@/lib/admin-api";

interface ReportActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: Report | null;
    isSubmitting: boolean;
    onReview: (id: string, note: string) => Promise<void>;
    onResolve: (
        id: string,
        note: string,
        rejectionReason?: string,
    ) => Promise<void>;
}

export function ReportActionModal({
    isOpen,
    onClose,
    report,
    isSubmitting,
    onReview,
    onResolve,
}: ReportActionModalProps) {
    const [resolutionNote, setResolutionNote] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        if (isOpen && report) {
            setResolutionNote(report.resolutionNote || "");
            setRejectionReason("");
        }
    }, [isOpen, report]);

    if (!isOpen || !report) return null;

    const isResolved = report.status === "RESOLVED";
    const needsRejectionReason =
        report.targetType === "SUPPORT_REQUEST" && !isResolved;

    const targetTypeLabels: Record<string, string> = {
        USER: "Người dùng",
        POST: "Bài viết",
        SUPPORT_REQUEST: "Yêu cầu hỗ trợ",
    };

    const handleReviewClick = async () => {
        await onReview(report.id, resolutionNote.trim());
    };

    const handleResolveClick = async () => {
        if (needsRejectionReason && !rejectionReason.trim()) {
            alert("Vui lòng nhập lý do từ chối yêu cầu hỗ trợ.");
            return;
        }
        await onResolve(
            report.id,
            resolutionNote.trim(),
            needsRejectionReason ? rejectionReason.trim() : undefined,
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-black text-slate-900">
                        {isResolved ? "Chi tiết báo cáo" : "Xử lý báo cáo vi phạm"}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-100 text-sm">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-rose-500">
                                    Đối tượng vi phạm
                                </span>
                                <span className="font-bold text-rose-950">
                                    {targetTypeLabels[report.targetType] || report.targetType}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-rose-500">
                                    Người gửi báo cáo
                                </span>
                                <span className="font-bold text-rose-950">
                                    {report.reporterName}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-rose-500">
                                Lý do vi phạm
                            </span>
                            <p className="font-bold text-rose-900">
                                {report.reason}
                            </p>
                            {report.description && (
                                <p className="mt-1 text-rose-800 text-xs italic">
                                    {report.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Ghi chú xử lý của Quản trị viên {isResolved ? "" : "*"}
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            disabled={isSubmitting || isResolved}
                            className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none disabled:bg-slate-50 text-sm"
                            placeholder="Ghi chú kết quả điều tra và phương án xử lý..."
                        />
                    </div>

                    {needsRejectionReason && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-rose-700 mb-1.5">
                                Lý do từ chối yêu cầu hỗ trợ *
                            </label>
                            <textarea
                                required
                                rows={2}
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                                disabled={isSubmitting}
                                className="w-full px-3.5 py-2.5 border-2 border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none bg-rose-50/50 text-sm"
                                placeholder="Lý do này sẽ được gửi trực tiếp tới người yêu cầu..."
                            />
                            <p className="text-[11px] font-medium text-rose-600 mt-1">
                                * Bắt buộc vì khi giải quyết báo cáo, yêu cầu hỗ trợ này sẽ tự động bị TỪ CHỐI.
                            </p>
                        </div>
                    )}

                    {isResolved && report.resolvedByName && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            Đã giải quyết bởi{" "}
                            <span className="font-bold text-slate-800">
                                {report.resolvedByName}
                            </span>
                            {report.resolvedAt && (
                                <>
                                    {" "}
                                    vào lúc{" "}
                                    <span className="font-medium text-slate-500">
                                        {new Date(
                                            report.resolvedAt,
                                        ).toLocaleString("vi-VN")}
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-11 rounded-2xl border-2 border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-[0_3px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                            {isResolved ? "Đóng" : "Hủy bỏ"}
                        </button>

                        {!isResolved && (
                            <>
                                {report.status === "PENDING" && (
                                    <button
                                        type="button"
                                        onClick={handleReviewClick}
                                        disabled={isSubmitting}
                                        className="h-11 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 text-sm font-black text-amber-800 shadow-[0_3px_0_0_#fde68a] hover:bg-amber-100 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        Đánh dấu Đang xem xét
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleResolveClick}
                                    disabled={
                                        isSubmitting || !resolutionNote.trim()
                                    }
                                    className="h-11 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-[0_4px_0_0_#9f1239] hover:bg-rose-500 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
                                >
                                    {isSubmitting
                                        ? "Đang xử lý..."
                                        : "Xác nhận Giải quyết vi phạm"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
