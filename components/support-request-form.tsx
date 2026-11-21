"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth-provider";
import { LocationPicker } from "@/components/location-picker";
import { Notice } from "@/components/support-ui";
import {
  getCategories,
  type CategorySummary,
  type SupportRequestPayload,
} from "@/lib/api";

export type SupportRequestFormValue = {
  title: string;
  description: string;
  categoryId: string;
  address: string;
  latitude: string;
  longitude: string;
};

const emptyForm: SupportRequestFormValue = {
  title: "",
  description: "",
  categoryId: "",
  address: "",
  latitude: "",
  longitude: "",
};

export function SupportRequestForm({
  initialValue = emptyForm,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialValue?: SupportRequestFormValue;
  submitLabel: string;
  onSubmit: (payload: SupportRequestPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const { getAccessToken } = useAuth();
  const [form, setForm] = useState(initialValue);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const token = await getAccessToken();
        const data = await getCategories(token);

        if (!cancelled) {
          setCategories(data);
          setForm((current) => ({
            ...current,
            categoryId: current.categoryId || data[0]?.id || "",
          }));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      !form.latitude.trim() ||
      !form.longitude.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setError("Vui lòng tìm kiếm vị trí hoặc chọn một điểm trên bản đồ.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: SupportRequestPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        latitude,
        longitude,
      };

      if (form.address.trim()) {
        payload.address = form.address.trim();
      }

      await onSubmit(payload);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Tiêu đề yêu cầu hỗ trợ" className="lg:col-span-2">
          <input
            required
            maxLength={200}
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            placeholder="Ví dụ: Cần hỗ trợ khẩn cấp chi phí y tế và thuốc men"
            className={inputClassName}
          />
        </Field>

        <Field label="Danh mục hỗ trợ">
          <select
            required
            disabled={loadingCategories}
            value={form.categoryId}
            onChange={(event) =>
              setForm({ ...form, categoryId: event.target.value })
            }
            className={inputClassName}
          >
            <option value="">
              {loadingCategories ? "Đang tải danh mục..." : "Chọn danh mục phù hợp"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mô tả hoàn cảnh và nhu cầu chi tiết" className="lg:col-span-2">
          <textarea
            required
            rows={7}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Mô tả cụ thể hoàn cảnh, các khó khăn gặp phải và thông tin hỗ trợ cần thiết để cộng đồng nắm rõ..."
            className={`${inputClassName} min-h-40 resize-y py-3`}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Lưu ý: Tuyệt đối không chia sẻ mật khẩu tài khoản, thông tin OTP hoặc dữ liệu riêng tư nhạy cảm.
          </p>
        </Field>

        <div className="lg:col-span-2">
          <LocationPicker
            required
            disabled={submitting}
            label="Địa điểm cần hỗ trợ"
            value={{
              address: form.address,
              latitude: form.latitude,
              longitude: form.longitude,
            }}
            onChange={(location) =>
              setForm((current) => ({ ...current, ...location }))
            }
          />
        </div>
      </div>

      {error ? (
        <div className="mt-5">
          <Notice type="error">{error}</Notice>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t-2 border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="h-11 rounded-2xl border-2 border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-[0_3px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-60"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={submitting || loadingCategories || !categories.length}
          className="h-11 rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-[0_4px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-1 active:shadow-none transition-all disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {submitting ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-bold text-slate-800">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-2xl border-2 border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Không thể lưu thông tin yêu cầu.";
}
