"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import {
    LoadingBlock,
    Notice,
    PageHeading,
    EmptyState,
} from "@/components/support-ui";
import {
    getRoleUpgradeRequestsList,
    approveRoleUpgradeRequest,
    rejectRoleUpgradeRequest,
    RoleUpgradeRequest,
    RoleUpgradeRequestStatus,
} from "@/lib/admin-api";

export function AdminRoleUpgradesClient() {
    const { getAccessToken } = useAuth();

    const [requests, setRequests] = useState<RoleUpgradeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [statusFilter, setStatusFilter] = useState<
        RoleUpgradeRequestStatus | "ALL"
    >("PENDING");

    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            const response = await getRoleUpgradeRequestsList(token, {
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                page,
                size: 10,
            });

            setRequests(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách yêu cầu nâng cấp vai trò.");
        } finally {
            setLoading(false);
        }
    }, [getAccessToken, statusFilter, page]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleStatusChange = (
        newStatus: RoleUpgradeRequestStatus | "ALL",
    ) => {
        setStatusFilter(newStatus);
        setPage(0);
    };

    const handleApprove = async (id: string) => {
        if (
            !window.confirm(
                "Phê duyệt yêu cầu này? Người dùng sẽ ngay lập tức được nâng cấp vai trò thành Điều phối viên (COLLABORATOR).",
            )
        )
            return;

        setProcessingId(id);
        try {
            const token = await getAccessToken();
            await approveRoleUpgradeRequest(token, id);
            fetchRequests();
        } catch (err: any) {
            alert(`Lỗi khi phê duyệt: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt("Vui lòng nhập lý do từ chối đơn nâng cấp:");
        if (reason === null) return;
        if (!reason.trim()) {
            alert("Lý do từ chối không được để trống.");
            return;
        }

        setProcessingId(id);
        try {
            const token = await getAccessToken();
            await rejectRoleUpgradeRequest(token, id, {
                rejectionReason: reason.trim(),
            });
            fetchRequests();
        } catch (err: any) {
            alert(`Lỗi khi từ chối: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const statusLabels: Record<string, string> = {
        PENDING: "Chờ phê duyệt",
        APPROVED: "Đã phê duyệt",
        REJECTED: "Đã từ chối",
        CANCELLED: "Đã hủy",
    };

    return (
        <>
            <PageHeading
                eyebrow="Phân quyền hệ thống"
                title="Yêu cầu nâng cấp vai trò"
                description="Xét duyệt các đơn đăng ký nâng cấp vai trò từ Tình nguyện viên lên Điều phối viên."
            />

            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-3 flex-wrap">
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            handleStatusChange(
                                e.target.value as
                                    | RoleUpgradeRequestStatus
                                    | "ALL",
                            )
                        }
                        className="px-3.5 py-2 text-sm border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 min-w-[170px]"
                    >
                        <option value="ALL">Tất cả yêu cầu</option>
                        <option value="PENDING">Chờ duyệt (Cần xử lý)</option>
                        <option value="APPROVED">Đã phê duyệt</option>
                        <option value="REJECTED">Đã từ chối</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>

                    <button
                        onClick={fetchRequests}
                        className="px-4 py-2 text-sm font-black text-slate-700 bg-white border-2 border-slate-200 rounded-xl shadow-[0_2px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                    >
                        Làm mới
                    </button>
                </div>

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
                            title="Không có yêu cầu nâng cấp nào"
                            description="Tất cả các đơn đã được xử lý xong."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 min-w-[170px]">
                                        Người đăng ký
                                    </th>
                                    <th className="px-5 py-3 min-w-[250px]">
                                        Lý do & Hồ sơ năng lực
                                    </th>
                                    <th className="px-5 py-3">Trạng thái</th>
                                    <th className="px-5 py-3 text-right">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((req) => {
                                    const isProcessing =
                                        processingId === req.id;
                                    const isPending = req.status === "PENDING";

                                    return (
                                        <tr
                                            key={req.id}
                                            className="hover:bg-slate-50 transition"
                                        >
                                            <td className="px-5 py-3 align-top">
                                                <p className="font-bold text-slate-900">
                                                    {req.userFullName}
                                                </p>
                                                <p
                                                    className="text-[10px] text-slate-500 font-mono mt-1"
                                                    title={req.userId}
                                                >
                                                    Mã:{" "}
                                                    {req.userId
                                                        ? req.userId.substring(
                                                              0,
                                                              8,
                                                          )
                                                        : "N/A"}
                                                    ...
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1 font-medium">
                                                    {new Date(
                                                        req.createdAt,
                                                    ).toLocaleDateString("vi-VN")}
                                                </p>
                                            </td>

                                            <td className="px-5 py-3 align-top">
                                                <p className="text-sm text-slate-700 italic">
                                                    "{req.reason}"
                                                </p>
                                                {req.supportingDocumentsUrl && (
                                                    <a
                                                        href={
                                                            req.supportingDocumentsUrl
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
                                                    >
                                                        📎 Xem tài liệu chứng minh &rarr;
                                                    </a>
                                                )}
                                                {req.rejectionReason && (
                                                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                                                        <span className="font-bold">
                                                            Lý do từ chối:{" "}
                                                        </span>
                                                        {req.rejectionReason}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-3 align-top">
                                                <span
                                                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded
                          ${
                              req.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : req.status === "APPROVED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                          }`}
                                >
                                                    {statusLabels[req.status] || req.status}
                                                </span>
                                                {req.processedByName &&
                                                    !isPending && (
                                                        <p className="text-[10px] text-slate-400 mt-1">
                                                            Bởi:{" "}
                                                            {
                                                                req.processedByName
                                                            }
                                                        </p>
                                                    )}
                                            </td>

                                            <td className="px-5 py-3 text-right align-top">
                                                {isPending ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    req.id,
                                                                )
                                                            }
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                                                        >
                                                            Phê duyệt
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleReject(
                                                                    req.id,
                                                                )
                                                            }
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 hover:bg-rose-100 disabled:opacity-50 transition cursor-pointer"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">
                                                        Đã xử lý
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                        <p className="text-xs text-slate-500 font-medium">
                            Trang{" "}
                            <span className="font-bold text-slate-800">
                                {page + 1}
                            </span>{" "}
                            trên{" "}
                            <span className="font-bold text-slate-800">
                                {totalPages}
                            </span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(0, p - 1))
                                }
                                disabled={page === 0}
                                className="px-3 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(totalPages - 1, p + 1),
                                    )
                                }
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                            >
                                Tiếp
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
