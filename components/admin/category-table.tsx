"use client";

import { Category } from "@/lib/admin-api";

interface CategoryTableProps {
    categories: Category[];
    processingId: string | null;
    onEdit: (category: Category) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function CategoryTable({
    categories,
    processingId,
    onEdit,
    onToggleStatus,
}: CategoryTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-5 py-3">Danh mục</th>
                        <th className="px-5 py-3">Mã Code</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => {
                        const isProcessing = processingId === cat.id;

                        return (
                            <tr
                                key={cat.id}
                                className="hover:bg-slate-50 transition"
                            >
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {cat.name}
                                            </p>
                                            <p
                                                className="text-xs text-slate-500 max-w-xs truncate mt-0.5"
                                                title={cat.description}
                                            >
                                                {cat.description}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-3">
                                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-bold">
                                        {cat.code}
                                    </span>
                                </td>

                                <td className="px-5 py-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cat.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${cat.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                                        ></span>
                                        {cat.isActive ? "Đang sử dụng" : "Ngừng dùng"}
                                    </span>
                                </td>

                                <td className="px-5 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(cat)}
                                            disabled={isProcessing}
                                            className="text-xs font-bold px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50 cursor-pointer"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() =>
                                                onToggleStatus(
                                                    cat.id,
                                                    cat.isActive,
                                                )
                                            }
                                            disabled={isProcessing}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer
                        ${cat.isActive ? "text-rose-600 hover:bg-rose-50" : "text-emerald-700 hover:bg-emerald-50"}`}
                                        >
                                            {isProcessing
                                                ? "Đang xử lý..."
                                                : cat.isActive
                                                  ? "Ngừng hoạt động"
                                                  : "Kích hoạt"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
