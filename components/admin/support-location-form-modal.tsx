"use client";

import { useState, useEffect } from "react";

import { LocationPicker } from "@/components/location-picker";
import { SupportLocation } from "@/lib/admin-api";

interface SupportLocationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        payload: Omit<SupportLocation, "id" | "isActive" | "createdAt">,
    ) => Promise<void>;
    initialData?: SupportLocation | null;
    isSubmitting: boolean;
}

export function SupportLocationFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    isSubmitting,
}: SupportLocationFormModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setLocationError(null);

            if (initialData) {
                setName(initialData.name || "");
                setDescription(initialData.description || "");
                setAddress(initialData.address || "");
                setContactPhone(initialData.contactPhone || "");
                setLatitude(initialData.latitude?.toString() || "");
                setLongitude(initialData.longitude?.toString() || "");
                setBankName(initialData.bankName || "");
                setBankAccountNumber(initialData.bankAccountNumber || "");
            } else {
                setName("");
                setDescription("");
                setAddress("");
                setContactPhone("");
                setLatitude("");
                setLongitude("");
                setBankName("");
                setBankAccountNumber("");
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsedLatitude = Number(latitude);
        const parsedLongitude = Number(longitude);

        if (
            !latitude.trim() ||
            !longitude.trim() ||
            !Number.isFinite(parsedLatitude) ||
            !Number.isFinite(parsedLongitude)
        ) {
            setLocationError(
                "Vui lòng tìm kiếm vị trí hoặc chọn một điểm trên bản đồ.",
            );
            return;
        }

        await onSave({
            name: name.trim(),
            description: description.trim(),
            address: address.trim(),
            contactPhone: contactPhone.trim(),
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            bankName: bankName.trim() || null,
            bankAccountNumber: bankAccountNumber.trim() || null,
        });
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
            <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 sm:max-h-[calc(100dvh-3rem)]">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
                    <h3 className="text-lg font-black text-slate-900">
                        {initialData
                            ? "Chỉnh sửa trạm tiếp nhận"
                            : "Thêm trạm tiếp nhận mới"}
                    </h3>
                    <button
                        type="button"
                        aria-label="Đóng"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:p-6"
                >
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            Thông tin chung
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Tên trạm tiếp nhận *
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                                    placeholder="VD: Trạm hỗ trợ Trung tâm Quận 1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Số điện thoại hotline *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    minLength={9}
                                    maxLength={15}
                                    value={contactPhone}
                                    onChange={(e) =>
                                        setContactPhone(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                                    placeholder="VD: 0901234567"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Mô tả hoạt động *
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium text-slate-900"
                                    placeholder="Thông tin về sức chứa, giờ mở cửa, loại vật tư tiếp nhận..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-4">
                            Địa chỉ & Tọa độ bản đồ
                        </h4>
                        <LocationPicker
                            required
                            disabled={isSubmitting}
                            label="Địa điểm đặt trạm"
                            value={{ address, latitude, longitude }}
                            onChange={(location) => {
                                setLocationError(null);
                                setAddress(location.address);
                                setLatitude(location.latitude);
                                setLongitude(location.longitude);
                            }}
                        />
                        {locationError ? (
                            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 border border-rose-200">
                                {locationError}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-4">
                            Thông tin tài khoản ngân hàng (Không bắt buộc)
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Tên ngân hàng
                                </label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) =>
                                        setBankName(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                                    placeholder="VD: Vietcombank, MB Bank..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Số tài khoản nhận hỗ trợ
                                </label>
                                <input
                                    type="text"
                                    value={bankAccountNumber}
                                    onChange={(e) =>
                                        setBankAccountNumber(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                                    placeholder="VD: 1029384756"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-11 rounded-2xl border-2 border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-[0_3px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !name?.trim() ||
                                !address?.trim() ||
                                !contactPhone?.trim() ||
                                !latitude.trim() ||
                                !longitude.trim()
                            }
                            className="h-11 rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-[0_4px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
                        >
                            {isSubmitting ? "Đang lưu..." : "Lưu trạm tiếp nhận"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
