"use client";

import { SupportLocation } from "@/lib/admin-api";

interface SupportLocationTableProps {
    locations: SupportLocation[];
    processingId: string | null;
    onEdit: (location: SupportLocation) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function SupportLocationTable({
    locations,
    processingId,
    onEdit,
    onToggleStatus,
}: SupportLocationTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-5 py-3 min-w-[200px]">
                            Thông tin trạm
                        </th>
                        <th className="px-5 py-3 min-w-[200px]">
                            Địa chỉ & Liên hệ
                        </th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {locations.map((loc) => {
                        const isProcessing = processingId === loc.id;

                        return (
                            <tr
                                key={loc.id}
                                className="hover:bg-slate-50 transition"
                            >
                                <td className="px-5 py-3 align-top">
                                    <p className="font-bold text-slate-900">
                                        {loc.name}
                                    </p>
                                    <p
                                        className="text-xs text-slate-500 max-w-xs line-clamp-2 mt-1"
                                        title={loc.description}
                                    >
                                        {loc.description}
                                    </p>
                                    {(loc.bankName ||
                                        loc.bankAccountNumber) && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                            <span>🏦 {loc.bankName || "Ngân hàng"}</span>
                                            <span>- {loc.bankAccountNumber}</span>
                                        </div>
                                    )}
                                </td>

                                <td className="px-5 py-3 align-top">
                                    <p className="text-sm font-medium text-slate-700">
                                        {loc.address}
                                    </p>
                                    <p className="mt-1 text-xs font-bold text-emerald-700">
                                        📞 Hotline: {loc.contactPhone}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                        Vĩ độ: {loc.latitude} | Kinh độ: {loc.longitude}
                                    </p>
                                </td>

                                <td className="px-5 py-3 align-top">
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${loc.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${loc.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                                        ></span>
                                        {loc.isActive ? "Đang hoạt động" : "Tạm dừng"}
                                    </span>
                                </td>

                                <td className="px-5 py-3 text-right align-top">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(loc)}
                                            disabled={isProcessing}
                                            className="text-xs font-bold px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50 cursor-pointer"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() =>
                                                onToggleStatus(
                                                    loc.id,
                                                    loc.isActive,
                                                )
                                            }
                                            disabled={isProcessing}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer
                        ${loc.isActive ? "text-rose-600 hover:bg-rose-50" : "text-emerald-700 hover:bg-emerald-50"}`}
                                        >
                                            {isProcessing
                                                ? "Đang xử lý..."
                                                : loc.isActive
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
