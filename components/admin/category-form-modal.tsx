"use client";

import { useState, useEffect } from "react";
import { Category } from "@/lib/admin-api";

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        payload: Omit<Category, "id" | "isActive" | "createdAt" | "updatedAt">,
    ) => Promise<void>;
    initialData?: Category | null;
    isSubmitting: boolean;
}

export function CategoryFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    isSubmitting,
}: CategoryFormModalProps) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [iconUrl, setIconUrl] = useState("");

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setCode(initialData.code || "");
            setDescription(initialData.description || "");
            setIconUrl(initialData.iconUrl || "");
        } else {
            setName("");
            setCode("");
            setDescription("");
            setIconUrl("");
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            name: name.trim(),
            code: code.trim().toUpperCase(),
            description: description.trim(),
            iconUrl: iconUrl.trim() || null,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900">
                        {initialData ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Tên danh mục *
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={100}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                                placeholder="VD: Vật tư y tế & Thuốc men"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Mã ký hiệu (Code) *
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={50}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono font-bold text-slate-900"
                                placeholder="VD: MEDICAL"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Mô tả danh mục *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium text-slate-900"
                            placeholder="Mô tả các loại nhu cầu, hàng hóa thuộc danh mục này..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Đường dẫn Icon (Tùy chọn)
                        </label>
                        <input
                            type="url"
                            value={iconUrl}
                            onChange={(e) => setIconUrl(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                            placeholder="https://example.com/icon.png"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
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
                                isSubmitting || !name?.trim() || !code?.trim()
                            }
                            className="h-11 rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-[0_4px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
                        >
                            {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
