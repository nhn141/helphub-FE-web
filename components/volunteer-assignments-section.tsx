"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth-provider";
import {
  AssignmentStatusBadge,
  Notice,
} from "@/components/support-ui";
import {
  approveVolunteerAssignment,
  rejectVolunteerAssignment,
  type VolunteerAssignment,
} from "@/lib/api";
import { formatDateTime } from "@/lib/support-request-ui";

export function VolunteerAssignmentsSection({
  supportRequestId,
  assignments,
  canReview,
  onChanged,
}: {
  supportRequestId: string;
  assignments: VolunteerAssignment[];
  canReview: boolean;
  onChanged: () => Promise<void>;
}) {
  const { getAccessToken } = useAuth();
  const [rejectingVolunteerId, setRejectingVolunteerId] = useState<
    string | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [busyVolunteerId, setBusyVolunteerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve(volunteerId: string) {
    setBusyVolunteerId(volunteerId);
    setError(null);

    try {
      const token = await getAccessToken();
      await approveVolunteerAssignment(
        token,
        supportRequestId,
        volunteerId,
      );
      await onChanged();
    } catch (approveError) {
      setError(getErrorMessage(approveError));
    } finally {
      setBusyVolunteerId(null);
    }
  }

  async function reject(volunteerId: string) {
    setBusyVolunteerId(volunteerId);
    setError(null);

    try {
      const token = await getAccessToken();
      await rejectVolunteerAssignment(
        token,
        supportRequestId,
        volunteerId,
        rejectionReason,
      );
      setRejectingVolunteerId(null);
      setRejectionReason("");
      await onChanged();
    } catch (rejectError) {
      setError(getErrorMessage(rejectError));
    } finally {
      setBusyVolunteerId(null);
    }
  }

  return (
    <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-black text-slate-950">
          Đơn đăng ký tình nguyện
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Xem xét các tình nguyện viên đã đăng ký tham gia hỗ trợ cho yêu cầu này.
        </p>
      </div>

      {error ? (
        <div className="mt-4">
          <Notice type="error">{error}</Notice>
        </div>
      ) : null}

      {assignments.length ? (
        <div className="mt-5 space-y-3">
          {assignments.map((assignment) => (
            <article
              key={assignment.volunteerId}
              className="rounded-2xl border-2 border-slate-200 p-4 transition hover:border-emerald-300"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-950">
                      {assignment.volunteerName}
                    </h3>
                    <AssignmentStatusBadge status={assignment.status} />
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-500 font-medium">
                    <p>{assignment.volunteerEmail}</p>
                    <p>{assignment.volunteerPhone || "Chưa cung cấp số điện thoại"}</p>
                    <p className="text-xs text-slate-400">
                      Đã nộp đơn lúc {formatDateTime(assignment.assignedAt)}
                    </p>
                  </div>
                </div>

                {canReview && assignment.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyVolunteerId === assignment.volunteerId}
                      onClick={() => void approve(assignment.volunteerId)}
                      className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-[0_2px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-0.5 active:shadow-none transition disabled:bg-slate-300 disabled:shadow-none"
                    >
                      Chấp thuận
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingVolunteerId(assignment.volunteerId);
                        setRejectionReason("");
                      }}
                      className="h-9 rounded-xl border border-rose-200 px-3.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
                    >
                      Từ chối
                    </button>
                  </div>
                ) : null}
              </div>

              {assignment.rejectionReason ? (
                <p className="mt-3 rounded-xl bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-800 border border-rose-200">
                  Lý do từ chối: {assignment.rejectionReason}
                </p>
              ) : null}

              {rejectingVolunteerId === assignment.volunteerId ? (
                <div className="mt-4 rounded-2xl bg-rose-50/80 border-2 border-rose-200 p-4">
                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-rose-900">
                      Lý do từ chối (bắt buộc)
                    </span>
                    <textarea
                      required
                      maxLength={200}
                      rows={3}
                      value={rejectionReason}
                      onChange={(event) =>
                        setRejectionReason(event.target.value)
                      }
                      className="w-full rounded-xl border-2 border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                  </label>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectingVolunteerId(null)}
                      className="h-8 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={
                        !rejectionReason.trim() ||
                        busyVolunteerId === assignment.volunteerId
                      }
                      onClick={() => void reject(assignment.volunteerId)}
                      className="h-8 rounded-xl bg-rose-600 px-3.5 text-xs font-bold text-white shadow-[0_2px_0_0_#9f1239] hover:bg-rose-500 active:translate-y-0.5 active:shadow-none transition disabled:bg-slate-300 disabled:shadow-none"
                    >
                      Xác nhận từ chối
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-bold text-slate-700">
            Chưa có đơn đăng ký tình nguyện nào
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Các tình nguyện viên đăng ký sẽ hiển thị tại đây.
          </p>
        </div>
      )}
    </section>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Không thể xử lý đơn đăng ký tình nguyện.";
}
