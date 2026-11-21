import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Heart, Info, Loader2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type {
  SupportRequestStatus,
  VolunteerAssignmentStatus,
} from "@/lib/api";
import {
  assignmentStatusClassName,
  statusClassName,
  SUPPORT_REQUEST_STATUS_LABELS,
  VOLUNTEER_STATUS_LABELS,
} from "@/lib/support-request-ui";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-emerald-800 shadow-[0_2px_0_0_#a7f3d0]">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: SupportRequestStatus }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border-2 px-3 text-xs font-black tracking-wide shadow-[0_2px_0_0_rgba(0,0,0,0.04)] ${statusClassName(status)}`}
    >
      {SUPPORT_REQUEST_STATUS_LABELS[status]}
    </span>
  );
}

export function AssignmentStatusBadge({
  status,
}: {
  status: VolunteerAssignmentStatus;
}) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border-2 px-3 text-xs font-black tracking-wide shadow-[0_2px_0_0_rgba(0,0,0,0.04)] ${assignmentStatusClassName(status)}`}
    >
      {VOLUNTEER_STATUS_LABELS[status]}
    </span>
  );
}

export function LoadingBlock({ message = "Đang tải dữ liệu..." }: { message?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-3xl border-2 border-slate-200/90 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-[0_4px_0_0_#a7f3d0]">
          <Loader2 className="size-7 animate-spin stroke-[2.5]" />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-700">{message}</p>
        <p className="mt-1 text-xs text-slate-400">Vui lòng chờ một chút...</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/70 p-8 text-center transition-colors">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-[0_4px_0_0_#a7f3d0]">
        <Heart className="size-7 stroke-[2.2]" />
      </div>
      <h2 className="mt-4 text-lg font-black tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={buttonVariants({
            variant: "default",
            size: "default",
            className: "mt-5",
          })}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Notice({
  type,
  children,
}: {
  type: "success" | "error" | "info";
  children: ReactNode;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-[0_3px_0_0_#a7f3d0]",
    error: "border-rose-200 bg-rose-50 text-rose-950 shadow-[0_3px_0_0_#fecdd3]",
    info: "border-sky-200 bg-sky-50 text-sky-950 shadow-[0_3px_0_0_#bae6fd]",
  };

  const icons = {
    success: <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />,
    error: <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />,
    info: <Info className="size-5 shrink-0 text-sky-600 mt-0.5" />,
  };

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-sm font-semibold leading-relaxed ${styles[type]}`}
    >
      {icons[type]}
      <div className="flex-1">{children}</div>
    </div>
  );
}
