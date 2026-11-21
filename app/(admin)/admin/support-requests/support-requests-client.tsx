"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import {
    LoadingBlock,
    Notice,
    PageHeading,
    EmptyState,
} from "@/components/support-ui";
import { SupportRequestFilters } from "@/components/admin/support-request-filters";
import { SupportRequestTable } from "@/components/admin/support-request-table";
import { SupportRequestSummary, SupportRequestStatus } from "@/lib/api";

import {
    getAdminSupportRequests,
    approveSupportRequest,
    rejectSupportRequest,
    assignSupportLocationToRequest,
    getAdminCategories,
    getAdminSupportLocations,
    Category,
    SupportLocation,
} from "@/lib/admin-api";

export function AdminSupportRequestsClient() {
    const { getAccessToken } = useAuth();

    const [requests, setRequests] = useState<SupportRequestSummary[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<SupportLocation[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<
        SupportRequestStatus | "ALL"
    >("PENDING");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        async function loadMeta() {
            try {
                const token = await getAccessToken();
                const [cats, locs] = await Promise.all([
                    getAdminCategories(token, true),
                    getAdminSupportLocations(token, true),
                ]);
                setCategories(cats);
                setLocations(locs);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        }
        loadMeta();
    }, [getAccessToken]);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            const data = await getAdminSupportRequests(token, {
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                categoryId:
                    categoryFilter !== "ALL" ? categoryFilter : undefined,
            });
            setRequests(data);
        } catch (err: any) {
            setError(err.message || "Failed to load support requests.");
        } finally {
            setLoading(false);
        }
    }, [getAccessToken, statusFilter, categoryFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id: string) => {
        if (
            !window.confirm(
                "Phê duyệt yêu cầu hỗ trợ này? Yêu cầu sẽ hiển thị công khai tới cộng đồng.",
            )
        )
            return;

        setProcessingId(id);
        try {
            const token = await getAccessToken();
            await approveSupportRequest(token, id);
            fetchRequests();
        } catch (err: any) {
            alert(`Lỗi khi phê duyệt: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt(
            "Vui lòng nhập lý do từ chối (bắt buộc):",
        );
        if (reason === null) return;
        if (!reason.trim()) {
            alert("Lý do từ chối không được để trống.");
            return;
        }

        setProcessingId(id);
        try {
            const token = await getAccessToken();
            await rejectSupportRequest(token, id, {
                rejectionReason: reason.trim(),
            });
            fetchRequests();
        } catch (err: any) {
            alert(`Lỗi khi từ chối: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleAssignLocation = async (id: string, locationId: string) => {
        if (!locationId) return;
        setProcessingId(id);
        try {
            const token = await getAccessToken();
            await assignSupportLocationToRequest(token, id, {
                supportLocationId: locationId,
            });
            alert("Đã chỉ định trạm tiếp nhận thành công!");
            fetchRequests();
        } catch (err: any) {
            alert(`Lỗi khi chỉ định trạm: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <>
            <PageHeading
                eyebrow="Kiểm duyệt & Điều phối"
                title="Quản lý yêu cầu hỗ trợ"
                description="Xét duyệt các yêu cầu hỗ trợ gửi đến, xác minh hoàn cảnh và chỉ định trạm tiếp nhận nguồn lực."
            />

            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
                <SupportRequestFilters
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    categories={categories}
                    onRefresh={fetchRequests}
                />

                {error && (
                    <div className="p-4">
                        <Notice type="error">{error}</Notice>
                    </div>
                )}

                {loading ? (
                    <div className="py-10">
                        <LoadingBlock message="Đang tải danh sách yêu cầu..." />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="py-8 border-t border-slate-100">
                        <EmptyState
                            title="Không tìm thấy yêu cầu nào"
                            description="Hãy thử thay đổi điều kiện lọc trạng thái hoặc danh mục."
                        />
                    </div>
                ) : (
                    <SupportRequestTable
                        requests={requests}
                        locations={locations}
                        processingId={processingId}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onAssignLocation={handleAssignLocation}
                    />
                )}
            </div>
        </>
    );
}
