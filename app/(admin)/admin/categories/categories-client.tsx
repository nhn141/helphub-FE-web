"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import {
    LoadingBlock,
    Notice,
    PageHeading,
    EmptyState,
} from "@/components/support-ui";
import { CategoryTable } from "@/components/admin/category-table";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import {
    getAdminCategories,
    createCategory,
    updateCategory,
    patchCategoryStatus,
    Category,
} from "@/lib/admin-api";

export function AdminCategoriesClient() {
    const { getAccessToken } = useAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            const data = await getAdminCategories(token, false);
            setCategories(data);
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách danh mục hỗ trợ.");
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // --- ACTIONS ---

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? "ngừng hoạt động" : "kích hoạt lại";
        if (
            !window.confirm(`Bạn có chắc muốn ${action} danh mục này?`)
        )
            return;

        setProcessingId(id);
        try {
            const token = await getAccessToken();
            await patchCategoryStatus(token, id, { isActive: !currentStatus });
            setCategories((prev) =>
                prev.map((cat) =>
                    cat.id === id ? { ...cat, isActive: !currentStatus } : cat,
                ),
            );
        } catch (err: any) {
            alert(`Lỗi khi đổi trạng thái: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleSaveCategory = async (
        payload: Omit<Category, "id" | "isActive" | "createdAt" | "updatedAt">,
    ) => {
        setIsSubmitting(true);
        try {
            const token = await getAccessToken();
            if (editingCategory) {
                // Cập nhật
                const updatedCat = await updateCategory(
                    token,
                    editingCategory.id,
                    payload,
                );
                setCategories((prev) =>
                    prev.map((cat) =>
                        cat.id === editingCategory.id ? updatedCat : cat,
                    ),
                );
            } else {
                // Tạo mới
                const newCat = await createCategory(token, payload);
                setCategories((prev) => [newCat, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            alert(`Thao tác thất bại: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    return (
        <>
            <PageHeading
                eyebrow="Phân loại hệ thống"
                title="Danh mục hỗ trợ"
                description="Quản lý hệ thống phân loại danh mục dùng cho các yêu cầu hỗ trợ HelpHub."
                action={
                    <button
                        onClick={openCreateModal}
                        className="inline-flex h-11 items-center rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-[0_4px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                    >
                        + Thêm danh mục mới
                    </button>
                }
            />

            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
                {error && (
                    <div className="p-4">
                        <Notice type="error">{error}</Notice>
                    </div>
                )}

                {loading ? (
                    <div className="py-10">
                        <LoadingBlock message="Đang tải danh mục..." />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-8 border-t border-slate-100">
                        <EmptyState
                            title="Chưa có danh mục nào"
                            description="Tạo danh mục đầu tiên để người dùng có thể phân loại yêu cầu hỗ trợ."
                        />
                    </div>
                ) : (
                    <CategoryTable
                        categories={categories}
                        processingId={processingId}
                        onEdit={openEditModal}
                        onToggleStatus={handleToggleStatus}
                    />
                )}
            </div>

            <CategoryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCategory}
                initialData={editingCategory}
                isSubmitting={isSubmitting}
            />
        </>
    );
}
