"use client";

import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth-provider";
import { Notice } from "@/components/support-ui";
import {
  contributeToSupportNeed,
  createSupportNeed,
  deleteSupportNeed,
  updateSupportNeed,
  type SupportNeed,
  type SupportNeedContribution,
  type SupportNeedPayload,
  type SupportNeedUnit,
  type SupportType,
} from "@/lib/api";
import {
  formatDateTime,
  formatQuantity,
  SUPPORT_NEED_UNITS,
  SUPPORT_NEED_UNIT_LABELS,
  SUPPORT_TYPE_LABELS,
} from "@/lib/support-request-ui";

type NeedForm = {
  supportType: SupportType;
  needName: string;
  unit: SupportNeedUnit;
  requiredQuantity: string;
};

const emptyNeedForm: NeedForm = {
  supportType: "GOODS",
  needName: "",
  unit: "KG",
  requiredQuantity: "",
};

export function SupportNeedsSection({
  supportRequestId,
  needs,
  contributions,
  canManage,
  canContribute,
  onChanged,
}: {
  supportRequestId: string;
  needs: SupportNeed[];
  contributions: Record<string, SupportNeedContribution[]>;
  canManage: boolean;
  canContribute: boolean;
  onChanged: () => Promise<void>;
}) {
  const { getAccessToken } = useAuth();
  const [editingNeedId, setEditingNeedId] = useState<string | null>(null);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [needForm, setNeedForm] = useState<NeedForm>(emptyNeedForm);
  const [contributingNeedId, setContributingNeedId] = useState<string | null>(
    null,
  );
  const [contributionQuantity, setContributionQuantity] = useState("");
  const [contributionNote, setContributionNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditingNeedId(null);
    setNeedForm(emptyNeedForm);
    setShowNeedForm(true);
    setError(null);
  }

  function startEdit(need: SupportNeed) {
    setEditingNeedId(need.id);
    setNeedForm({
      supportType: need.supportType,
      needName: need.needName,
      unit: need.unit,
      requiredQuantity: need.requiredQuantity.toString(),
    });
    setShowNeedForm(true);
    setError(null);
  }

  async function handleNeedSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const payload: SupportNeedPayload = {
        supportType: needForm.supportType,
        needName: needForm.needName.trim(),
        unit: needForm.unit,
        requiredQuantity: Number(needForm.requiredQuantity),
      };

      if (editingNeedId) {
        await updateSupportNeed(token, editingNeedId, payload);
      } else {
        await createSupportNeed(token, supportRequestId, payload);
      }

      setShowNeedForm(false);
      setEditingNeedId(null);
      setNeedForm(emptyNeedForm);
      await onChanged();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(need: SupportNeed) {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa nhu cầu "${need.needName}"? Hành động này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const token = await getAccessToken();
      await deleteSupportNeed(token, need.id);
      await onChanged();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusy(false);
    }
  }

  async function handleContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!contributingNeedId) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const token = await getAccessToken();
      await contributeToSupportNeed(
        token,
        contributingNeedId,
        Number(contributionQuantity),
        contributionNote.trim() || undefined,
      );
      setContributingNeedId(null);
      setContributionQuantity("");
      setContributionNote("");
      await onChanged();
    } catch (contributionError) {
      setError(getErrorMessage(contributionError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Nhu cầu hỗ trợ cụ thể
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi số lượng cần thiết, đã tiếp nhận và còn thiếu.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={startCreate}
            className="h-10 rounded-2xl bg-emerald-600 px-4 text-xs font-black text-white shadow-[0_3px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-0.5 active:shadow-none transition-all"
          >
            + Thêm nhu cầu
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4">
          <Notice type="error">{error}</Notice>
        </div>
      ) : null}

      {showNeedForm ? (
        <form
          onSubmit={handleNeedSubmit}
          className="mt-5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 p-4"
        >
          <h3 className="text-sm font-black text-slate-950">
            {editingNeedId ? "Chỉnh sửa nhu cầu" : "Thêm nhu cầu mới"}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Loại hỗ trợ">
              <select
                value={needForm.supportType}
                onChange={(event) =>
                  setNeedForm({
                    ...needForm,
                    supportType: event.target.value as SupportType,
                    unit:
                      event.target.value === "MONEY"
                        ? "VND"
                        : needForm.unit === "VND"
                          ? "KG"
                          : needForm.unit,
                  })
                }
                className={inputClassName}
              >
                <option value="GOODS">Nhu yếu phẩm / Hàng hóa</option>
                <option value="MONEY">Tiền mặt / Tài chính</option>
              </select>
            </FormField>
            <FormField label="Tên nhu cầu">
              <input
                required
                maxLength={100}
                value={needForm.needName}
                onChange={(event) =>
                  setNeedForm({ ...needForm, needName: event.target.value })
                }
                placeholder="Ví dụ: Gạo, mì tôm, thuốc hạ sốt, chi phí phẫu thuật..."
                className={inputClassName}
              />
            </FormField>
            <FormField label="Đơn vị tính">
              <select
                value={needForm.unit}
                disabled={needForm.supportType === "MONEY"}
                onChange={(event) =>
                  setNeedForm({
                    ...needForm,
                    unit: event.target.value as SupportNeedUnit,
                  })
                }
                className={inputClassName}
              >
                {SUPPORT_NEED_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {SUPPORT_NEED_UNIT_LABELS[unit]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Số lượng cần hỗ trợ">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={needForm.requiredQuantity}
                onChange={(event) =>
                  setNeedForm({
                    ...needForm,
                    requiredQuantity: event.target.value,
                  })
                }
                className={inputClassName}
              />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowNeedForm(false)}
              className="h-9 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={busy}
              className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-[0_2px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-0.5 active:shadow-none transition disabled:bg-slate-300 disabled:shadow-none"
            >
              {busy ? "Đang lưu..." : editingNeedId ? "Lưu thay đổi" : "Thêm mục này"}
            </button>
          </div>
        </form>
      ) : null}

      {needs.length ? (
        <div className="mt-5 space-y-4">
          {needs.map((need) => {
            const progress = Math.min(
              100,
              (need.receivedQuantity / need.requiredQuantity) * 100,
            );
            const needContributions = contributions[need.id] ?? [];

            return (
              <article
                key={need.id}
                className="rounded-2xl border-2 border-slate-200/90 p-4 transition hover:border-emerald-300"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-slate-950">
                        {need.needName}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                        {SUPPORT_TYPE_LABELS[need.supportType]}
                      </span>
                      {need.isFulfilled ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          Đã đủ
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Đã nhận{" "}
                      <strong className="text-slate-800">
                        {formatQuantity(need.receivedQuantity, need.unit)}
                      </strong>{" "}
                      / {formatQuantity(need.requiredQuantity, need.unit)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canContribute && !need.isFulfilled ? (
                      <button
                        type="button"
                        onClick={() => {
                          setContributingNeedId(need.id);
                          setContributionQuantity("");
                          setContributionNote("");
                          setError(null);
                        }}
                        className="h-8 rounded-xl bg-violet-600 px-3 text-xs font-bold text-white shadow-[0_2px_0_0_#5b21b6] hover:bg-violet-500 active:translate-y-0.5 active:shadow-none transition"
                      >
                        Đóng góp / Trao tặng
                      </button>
                    ) : null}
                    {canManage ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(need)}
                          className="h-8 rounded-xl border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={busy || need.receivedQuantity > 0}
                          onClick={() => void handleDelete(need)}
                          title={
                            need.receivedQuantity > 0
                              ? "Nhu cầu đã có người đóng góp không thể xóa"
                              : "Xóa nhu cầu này"
                          }
                          className="h-8 rounded-xl border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                        >
                          Xóa
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">
                  <span>{Math.round(progress)}% đã hoàn thành</span>
                  <span>
                    Còn thiếu: {formatQuantity(need.remainingQuantity, need.unit)}
                  </span>
                </div>

                {contributingNeedId === need.id ? (
                  <form
                    onSubmit={handleContribution}
                    className="mt-4 rounded-2xl bg-violet-50/80 border-2 border-violet-100 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField label="Số lượng đóng góp">
                        <input
                          required
                          type="number"
                          min="0.01"
                          max={need.remainingQuantity}
                          step="0.01"
                          value={contributionQuantity}
                          onChange={(event) =>
                            setContributionQuantity(event.target.value)
                          }
                          className={inputClassName}
                        />
                      </FormField>
                      <FormField label="Ghi chú đóng góp">
                        <input
                          maxLength={500}
                          value={contributionNote}
                          onChange={(event) =>
                            setContributionNote(event.target.value)
                          }
                          placeholder="Thông tin bàn giao, vận chuyển (tùy chọn)"
                          className={inputClassName}
                        />
                      </FormField>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setContributingNeedId(null)}
                        className="h-8 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={busy}
                        className="h-8 rounded-xl bg-violet-600 px-3 text-xs font-black text-white shadow-[0_2px_0_0_#5b21b6] hover:bg-violet-500 active:translate-y-0.5 active:shadow-none transition disabled:bg-slate-300 disabled:shadow-none"
                      >
                        {busy ? "Đang ghi nhận..." : "Xác nhận đóng góp"}
                      </button>
                    </div>
                  </form>
                ) : null}

                {needContributions.length ? (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Lịch sử đóng góp
                    </p>
                    <div className="mt-3 space-y-2">
                      {needContributions.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-800">
                              {item.contributorName}
                            </span>
                            <span className="text-slate-600">
                              {" "}
                              đã đóng góp{" "}
                              <strong>{formatQuantity(item.quantity, need.unit)}</strong>
                            </span>
                            {item.note ? (
                              <p className="mt-1 text-xs text-slate-500">
                                {item.note}
                              </p>
                            ) : null}
                          </div>
                          <span className="shrink-0 text-xs text-slate-400">
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-bold text-slate-700">
            Chưa có nhu cầu cụ thể nào
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {canManage
              ? "Hãy thêm các mục nhu cầu để người hỗ trợ biết chính xác số lượng cần thiết."
              : "Người yêu cầu chưa liệt kê danh sách nhu yếu phẩm hoặc tài chính cụ thể."}
          </p>
        </div>
      )}
    </section>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Không thể xử lý nhu cầu hỗ trợ.";
}
