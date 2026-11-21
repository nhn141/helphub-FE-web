"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import {
    LoadingBlock,
    Notice,
    PageHeading,
    EmptyState,
} from "@/components/support-ui";
import { ReportTable } from "@/components/admin/report-table";
import { ReportActionModal } from "@/components/admin/report-action-modal";
import {
    getAllReports,
    reviewReport,
    resolveReport,
    Report,
    ReportStatus,
} from "@/lib/admin-api";

export function AdminReportsClient() {
    const { getAccessToken } = useAuth();

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">(
        "ALL",
    );

    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            const data = await getAllReports(token);
            setReports(data);
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách báo cáo vi phạm.");
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const filteredReports =
        statusFilter === "ALL"
            ? reports
            : reports.filter((r) => r.status === statusFilter);

    const handleReview = async (id: string, note: string) => {
        setIsSubmitting(true);
        try {
            const token = await getAccessToken();
            await reviewReport(token, id, { resolutionNote: note });
            await fetchReports();
            setIsModalOpen(false);
        } catch (err: any) {
            alert(`Lỗi khi xem xét báo cáo: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolve = async (
        id: string,
        note: string,
        rejectionReason?: string,
    ) => {
        if (
            !window.confirm(
                "Bạn có chắc muốn GIẢI QUYẾT báo cáo này? Hành động này sẽ xử lý kỷ luật đối tượng vi phạm theo quy định.",
            )
        )
            return;

        setIsSubmitting(true);
        try {
            const token = await getAccessToken();
            await resolveReport(token, id, {
                resolutionNote: note,
                supportRequestRejectionReason: rejectionReason,
            });
            await fetchReports();
            setIsModalOpen(false);
        } catch (err: any) {
            alert(`Lỗi khi giải quyết báo cáo: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openActionModal = (report: Report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    return (
        <>
            <PageHeading
                eyebrow="Kiểm duyệt nội dung"
                title="Báo cáo vi phạm"
                description="Điều tra các báo cáo vi phạm tiêu chuẩn cộng đồng từ người dùng và xử lý kỷ luật."
            />

            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-3 flex-wrap">
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value as ReportStatus | "ALL",
                            )
                        }
                        className="px-3.5 py-2 text-sm border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 min-w-[170px]"
                    >
                        <option value="ALL">Tất cả báo cáo</option>
                        <option value="PENDING">Chờ xử lý (Cần giải quyết)</option>
                        <option value="REVIEWED">Đã xem xét (Đang theo dõi)</option>
                        <option value="RESOLVED">Đã giải quyết (Đã đóng)</option>
                    </select>

                    <button
                        onClick={fetchReports}
                        className="px-4 py-2 text-sm font-black text-slate-700 bg-white border-2 border-slate-200 rounded-xl shadow-[0_2px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                    >
                        Làm mới danh sách
                    </button>
                </div>

                {error && (
                    <div className="p-4">
                        <Notice type="error">{error}</Notice>
                    </div>
                )}

                {loading ? (
                    <div className="py-10">
                        <LoadingBlock message="Đang tải danh sách báo cáo..." />
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="py-8 border-t border-slate-100">
                        <EmptyState
                            title="Không có báo cáo nào"
                            description="Cộng đồng HelpHub hiện tại rất tích cực và an toàn!"
                        />
                    </div>
                ) : (
                    <ReportTable
                        reports={filteredReports}
                        onActionClick={openActionModal}
                    />
                )}
            </div>

            <ReportActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                report={selectedReport}
                onReview={handleReview}
                onResolve={handleResolve}
                isSubmitting={isSubmitting}
            />
        </>
    );
}
