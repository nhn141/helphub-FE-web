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
    <Card className="group flex h-full flex-col overflow-hidden border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium px-2.5 py-0.5"
        >
          {request.categoryName}
        </Badge>
        <StatusBadge status={request.status} />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-5 pt-3">
        <Link
          href={`/support-requests/${request.id}`}
          className="group/link flex items-start justify-between gap-2 text-lg font-bold leading-snug text-foreground transition hover:text-emerald-700"
        >
          <span>{request.title}</span>
          <ArrowUpRight className="size-4 shrink-0 opacity-0 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-emerald-600" />
        </Link>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="size-4 shrink-0 text-muted-foreground/70" />
            <span className="truncate font-medium text-foreground/80">{request.requesterName}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="size-4 shrink-0 text-muted-foreground/70 mt-0.5" />
            <span className="line-clamp-2">
              {request.address || "No address provided"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col items-stretch border-t border-border/60 p-5 pt-3">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatDateTime(request.createdAt)}
          </span>
          <Link
            href={`/support-requests/${request.id}`}
            className="font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            View details &rarr;
          </Link>
        </div>
        {footer ? <div className="mt-3">{footer}</div> : null}
      </CardFooter>
    </Card>
  );
}
