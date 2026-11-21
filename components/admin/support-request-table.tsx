"use client";

import { SupportRequestSummary } from "@/lib/api";
import { SupportLocation } from "@/lib/admin-api";
import { SUPPORT_REQUEST_STATUS_LABELS } from "@/lib/support-request-ui";

interface SupportRequestTableProps {
    requests: SupportRequestSummary[];
    locations: SupportLocation[];
    processingId: string | null;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onAssignLocation: (id: string, locationId: string) => void;
}

export function SupportRequestTable({
    requests,
    locations,
    processingId,
    onApprove,
    onReject,
    onAssignLocation,
}: SupportRequestTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-5 py-3 min-w-[250px]">
                            Thông tin yêu cầu
                        </th>
                        <th className="px-5 py-3">Danh mục</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Thời gian</th>
                        <th className="px-5 py-3 min-w-[180px]">
                            Hành động / Trạm tiếp nhận
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {requests.map((req) => {
                        const isProcessing = processingId === req.id;

                        return (
                            <tr
                                key={req.id}
                                className="hover:bg-slate-50 transition"
                            >
                                <td className="px-5 py-3">
                                    <p
                                        className="font-bold text-slate-900 truncate max-w-[250px]"
                                        title={req.title}
                                    >
                                        {req.title}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Người gửi: {req.requesterName}
                                    </p>
                                </td>

                                <td className="px-5 py-3">
                                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                                        {req.categoryName}
                                    </span>
                                </td>

                                <td className="px-5 py-3">
                                    <span
                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded
                          ${
                              req.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : req.status === "APPROVED" ||
                                      req.status === "IN_PROGRESS"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : req.status === "REJECTED" ||
                                        req.status === "CANCELLED"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-blue-100 text-blue-800"
                          }`}
                                    >
                                        {SUPPORT_REQUEST_STATUS_LABELS[
                                            req.status
                                        ] || req.status}
                                    </span>
                                </td>

                                <td className="px-5 py-3 text-xs text-slate-500 font-medium">
                                    {new Date(
                                        req.createdAt,
                                    ).toLocaleDateString("vi-VN", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })}
                                </td>

                                <td className="px-5 py-3">
                                    {req.status === "PENDING" && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    onApprove(req.id)
                                                }
                                                disabled={isProcessing}
                                                className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                                            >
                                                Phê duyệt
                                            </button>
                                            <button
                                                onClick={() => onReject(req.id)}
                                                disabled={isProcessing}
                                                className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 hover:bg-rose-100 disabled:opacity-50 transition cursor-pointer"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}

                                    {(req.status === "APPROVED" ||
                                        req.status === "IN_PROGRESS") && (
                                        <select
                                            disabled={isProcessing}
                                            onChange={(e) =>
                                                onAssignLocation(
                                                    req.id,
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-2 py-1.5 text-xs border border-emerald-300 rounded-lg bg-emerald-50 text-emerald-800 font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                -- Chỉ định trạm tiếp nhận --
                                            </option>
                                            {locations.map((loc) => (
                                                <option
                                                    key={loc.id}
                                                    value={loc.id}
                                                >
                                                    {loc.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {req.status !== "PENDING" &&
                                        req.status !== "APPROVED" &&
                                        req.status !== "IN_PROGRESS" && (
                                            <span className="text-xs italic text-slate-400">
                                                Đã xử lý xong
                                            </span>
                                        )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
