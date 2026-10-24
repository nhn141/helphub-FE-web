import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Heart, Info, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
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
      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${statusClassName(status)}`}
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
      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${assignmentStatusClassName(status)}`}
    >
      {VOLUNTEER_STATUS_LABELS[status]}
    </span>
  );
}

export function LoadingBlock({ message = "Loading data..." }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">{message}</p>
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
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center transition-colors">
      <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm ring-8 ring-emerald-50/50">
        <Heart className="size-6 stroke-[1.8]" />
      </div>
      <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={buttonVariants({
            className: "mt-5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm h-10 px-4",
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
    success: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800",
    info: "border-sky-200 bg-sky-50 text-sky-950 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800",
  };

  const icons = {
    success: <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />,
    error: <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />,
    info: <Info className="size-5 shrink-0 text-sky-600 mt-0.5" />,
  };

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 shadow-xs ${styles[type]}`}
    >
      {icons[type]}
      <div className="flex-1">{children}</div>
    </div>
  );
}
