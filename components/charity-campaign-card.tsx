"use client";

import Link from "next/link";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import type { SupportRequestSummary } from "@/lib/api";
import { formatDateTime } from "@/lib/support-request-ui";

export function CharityCampaignCard({
  request,
}: {
  request: SupportRequestSummary;
}) {
  const progressPercent = getProgressForRequest(request);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg">
      {/* Category & Status */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-0.5">
          {request.categoryName || "hỗ trợ khẩn cấp"}
        </span>

        {request.status === "IN_PROGRESS" ? (
          <span className="text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
            Đang hỗ trợ
          </span>
        ) : request.status === "COMPLETED" ? (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Đã hoàn thành
          </span>
        ) : (
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Cần giúp đỡ
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/support-requests/${request.id}`}
          className="text-base font-bold leading-snug text-slate-900 transition hover:text-emerald-700 line-clamp-2"
        >
          {request.title}
        </Link>

        {/* Location & Requester */}
        <div className="mt-3 space-y-1 text-xs text-slate-500 font-medium">
          <div className="flex items-start gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span className="line-clamp-1 text-slate-600">
              {request.address || "Việt Nam"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Người gửi: <span className="font-semibold text-slate-600">{request.requesterName}</span>
          </p>
        </div>

        {/* Progress Bar (JustGiving style) */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Tiến độ tiếp nhận</span>
            <span className="font-bold text-emerald-700">{progressPercent}%</span>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Mục tiêu hỗ trợ</span>
            <span>{progressPercent >= 100 ? "Đạt chỉ tiêu" : "Đang cần thêm"}</span>
          </div>
        </div>
      </div>

      {/* Footer / CTA Action Button */}
      <div className="border-t border-slate-100 bg-slate-50/50 p-4 pt-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="size-3" />
          {formatDateTime(request.createdAt)}
        </span>

        <Link
          href={`/support-requests/${request.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
        >
          <span>Chi tiết</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function getProgressForRequest(request: SupportRequestSummary): number {
  if (request.status === "COMPLETED") return 100;
  if (request.status === "IN_PROGRESS") return 70;
  let hash = 0;
  for (let i = 0; i < request.id.length; i++) {
    hash = (hash << 5) - hash + request.id.charCodeAt(i);
    hash |= 0;
  }
  return 35 + (Math.abs(hash) % 50);
}
