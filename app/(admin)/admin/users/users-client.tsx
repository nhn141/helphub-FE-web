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
    getUsersList,
    patchUserRole,
    patchUserStatus,
    UserSummary,
    UserRole,
} from "@/lib/admin-api";
import { ROLE_LABELS } from "@/lib/support-request-ui";

export function UsersClient() {
    const { profile, getAccessToken } = useAuth();

    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            const response = await getUsersList(token, {
                keyword: keyword.trim() || undefined,
                role: roleFilter !== "ALL" ? roleFilter : undefined,
                page,
                size: 10,
                sort: "createdAt,desc",
            });

            setUsers(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    }, [getAccessToken, keyword, roleFilter, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setKeyword(searchInput);
        setPage(0);
    };

    const handleRoleChange = async (
        userId: string,
        currentRole: UserRole,
        newRole: UserRole,
    ) => {
        if (currentRole === newRole) return;

        if (newRole === "ADMIN") {
            const confirm = window.confirm(
                "Bạn có chắc muốn cấp quyền Quản trị viên (ADMIN) cho tài khoản này?",
            );
            if (!confirm) return;
        }

        setProcessingId(userId);
        try {
            const token = await getAccessToken();
            await patchUserRole(token, userId, { role: newRole });

            setUsers(
                users.map((u) =>
                    u.id === userId ? { ...u, role: newRole } : u,
                ),
            );
        } catch (err: any) {
            alert(`Lỗi khi thay đổi vai trò: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleStatusToggle = async (
        userId: string,
        currentStatus: boolean,
    ) => {
        const action = currentStatus ? "khóa" : "mở khóa";
        const confirm = window.confirm(
            `Bạn có chắc muốn ${action} tài khoản này?`,
        );
        if (!confirm) return;

        setProcessingId(userId);
        try {
            const token = await getAccessToken();
            await patchUserStatus(token, userId, { isActive: !currentStatus });

            setUsers(
                users.map((u) =>
                    u.id === userId ? { ...u, isActive: !currentStatus } : u,
                ),
            );
        } catch (err: any) {
            alert(`Lỗi khi đổi trạng thái: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <>
            <PageHeading
                eyebrow="Quản trị tài khoản"
                title="Danh sách người dùng"
                description="Quản lý tài khoản thành viên, phân công vai trò và kiểm soát quyền truy cập hệ thống."
            />

            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 w-full max-w-md relative"
                    >
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo họ tên, email hoặc số điện thoại..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 text-sm border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                    </form>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(
                                    e.target.value as UserRole | "ALL",
                                );
                                setPage(0);
                            }}
                            className="px-3.5 py-2 text-sm border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                        >
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="REQUESTER">Người cần hỗ trợ</option>
                            <option value="VOLUNTEER">Tình nguyện viên</option>
                            <option value="COLLABORATOR">Điều phối viên</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-4">
                        <Notice type="error">{error}</Notice>
                    </div>
                )}

                {loading ? (
                    <div className="py-10">
                        <LoadingBlock message="Đang tải danh sách người dùng..." />
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-8 border-t border-slate-100">
                        <EmptyState
                            title="Không tìm thấy người dùng nào"
                            description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc vai trò."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3">Người dùng</th>
                                    <th className="px-5 py-3">Vai trò</th>
                                    <th className="px-5 py-3">Trạng thái</th>
                                    <th className="px-5 py-3">Ngày tham gia</th>
                                    <th className="px-5 py-3 text-right">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => {
                                    const isMe = profile?.id === user.id;
                                    const isProcessing =
                                        processingId === user.id;

                                    return (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-slate-50 transition"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                                                        {user.avatarUrl ? (
                                                            <img
                                                                src={
                                                                    user.avatarUrl
                                                                }
                                                                alt={
                                                                    user.fullName
                                                                }
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            user.fullName
                                                                .charAt(0)
                                                                .toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 flex items-center gap-2">
                                                            {user.fullName}
                                                            {isMe && (
                                                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black">
                                                                    BẠN
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3">
                                                <select
                                                    value={user.role}
                                                    disabled={
                                                        isMe || isProcessing
                                                    }
                                                    onChange={(e) =>
                                                        handleRoleChange(
                                                            user.id,
                                                            user.role,
                                                            e.target
                                                                .value as UserRole,
                                                        )
                                                    }
                                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border-0 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500
                            ${
                                user.role === "ADMIN"
                                    ? "bg-amber-100 text-amber-800"
                                    : user.role === "COLLABORATOR"
                                      ? "bg-blue-100 text-blue-800"
                                      : user.role === "VOLUNTEER"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-slate-100 text-slate-800"
                            }`}
                                                >
                                                    <option value="REQUESTER">
                                                        Người cần hỗ trợ
                                                    </option>
                                                    <option value="VOLUNTEER">
                                                        Tình nguyện viên
                                                    </option>
                                                    <option value="COLLABORATOR">
                                                        Điều phối viên
                                                    </option>
                                                    <option value="ADMIN">
                                                        Quản trị viên
                                                    </option>
                                                </select>
                                            </td>

                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${user.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
                                                >
                                                    <span
                                                        className={`size-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                                                    ></span>
                                                    {user.isActive
                                                        ? "Hoạt động"
                                                        : "Bị khóa"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-3 text-xs text-slate-500 font-medium">
                                                {new Date(
                                                    user.createdAt,
                                                ).toLocaleDateString("vi-VN", {
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </td>

                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={() =>
                                                        handleStatusToggle(
                                                            user.id,
                                                            user.isActive,
                                                        )
                                                    }
                                                    disabled={
                                                        isMe || isProcessing
                                                    }
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer
                            ${
                                isMe
                                    ? "text-slate-300 cursor-not-allowed"
                                    : user.isActive
                                      ? "text-rose-600 hover:bg-rose-50"
                                      : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                                                >
                                                    {isProcessing
                                                        ? "Đang xử lý..."
                                                        : user.isActive
                                                          ? "Khóa tài khoản"
                                                          : "Mở khóa"}
                                                </button>
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
                            </span>{" "}
                            (Tổng {totalElements} người dùng)
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

function SearchIcon() {
    return (
        <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    );
}
