import Link from "next/link";
import { MapPin, User, ArrowUpRight, Clock } from "lucide-react";

import { StatusBadge } from "@/components/support-ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { SupportRequestSummary } from "@/lib/api";
import { formatDateTime } from "@/lib/support-request-ui";

export function SupportRequestCard({
  request,
  footer,
}: {
  request: SupportRequestSummary;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-800 border-2 border-emerald-200 font-bold px-3 py-0.5"
        >
          {request.categoryName}
        </Badge>
        <StatusBadge status={request.status} />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-5 pt-3">
        <Link
          href={`/support-requests/${request.id}`}
          className="group/link flex items-start justify-between gap-2 text-lg font-black leading-snug text-slate-900 transition hover:text-emerald-700"
        >
          <span>{request.title}</span>
          <ArrowUpRight className="size-4 shrink-0 opacity-0 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-emerald-600" />
        </Link>

        <div className="mt-4 space-y-2 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="size-3.5" />
            </div>
            <span className="truncate font-bold text-slate-700">{request.requesterName}</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 mt-0.5">
              <MapPin className="size-3.5" />
            </div>
            <span className="line-clamp-2 text-xs leading-relaxed text-slate-600">
              {request.address || "Chưa có địa chỉ cụ thể"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col items-stretch border-t-2 border-slate-100 bg-slate-50/50 p-5 pt-3.5">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="size-3.5 text-slate-400" />
            {formatDateTime(request.createdAt)}
          </span>
          <Link
            href={`/support-requests/${request.id}`}
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            Chi tiết &rarr;
          </Link>
        </div>
        {footer ? <div className="mt-3">{footer}</div> : null}
      </CardFooter>
    </Card>
  );
}
