"use client";

import { SupportRequestStatus } from "@/lib/api";
import { Category } from "@/lib/admin-api";

interface SupportRequestFiltersProps {
    statusFilter: SupportRequestStatus | "ALL";
    setStatusFilter: (status: SupportRequestStatus | "ALL") => void;
    categoryFilter: string;
    setCategoryFilter: (categoryId: string) => void;
    categories: Category[];
    onRefresh: () => void;
}

export function SupportRequestFilters({
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    onRefresh,
}: SupportRequestFiltersProps) {
    return (
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-3 flex-wrap">
            <select
                value={statusFilter}
                onChange={(e) =>
                    setStatusFilter(
                        e.target.value as SupportRequestStatus | "ALL",
                    )
                }
                className="px-3.5 py-2 text-sm border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 min-w-[170px]"
            >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt (Cần xử lý)</option>
                <option value="APPROVED">Đã duyệt (Chờ chỉ định trạm)</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="REJECTED">Đã từ chối</option>
                <option value="CANCELLED">Đã hủy</option>
            </select>

            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 text-sm border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 min-w-[170px]"
            >
                <option value="ALL">Tất cả danh mục</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>

            <button
                onClick={onRefresh}
                className="px-4 py-2 text-sm font-black text-slate-700 bg-white border-2 border-slate-200 rounded-xl shadow-[0_2px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            >
                Làm mới
            </button>
        </div>
    );
}
