"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import {
    LoadingBlock,
    Notice,
    PageHeading,
    EmptyState,
} from "@/components/support-ui";
import { SupportLocationTable } from "@/components/admin/support-location-table";
import { SupportLocationFormModal } from "@/components/admin/support-location-form-modal";
import {
    getAdminSupportLocations,
    createSupportLocation,
    updateSupportLocation,
    patchSupportLocationStatus,
    SupportLocation,
} from "@/lib/admin-api";

export function AdminLocationsClient() {
    const { getAccessToken } = useAuth();

    const [locations, setLocations] = useState<SupportLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingLocation, setEditingLocation] =
        useState<SupportLocation | null>(null);

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            const data = await getAdminSupportLocations(token, false);
            setLocations(data);
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách trạm tiếp nhận.");
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    // --- ACTIONS ---

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? "ngừng hoạt động" : "kích hoạt lại";
        if (
            !window.confirm(
                `Bạn có chắc chắn muốn ${action} trạm tiếp nhận hỗ trợ này?`,
            )
        )
            return;

        setProcessingId(id);
        try {
            const token = await getAccessToken();
            await patchSupportLocationStatus(token, id, {
                isActive: !currentStatus,
            });
            setLocations((prev) =>
                prev.map((loc) =>
                    loc.id === id ? { ...loc, isActive: !currentStatus } : loc,
                ),
            );
        } catch (err: any) {
            alert(`Lỗi khi đổi trạng thái: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleSaveLocation = async (
        payload: Omit<SupportLocation, "id" | "isActive" | "createdAt">,
    ) => {
        setIsSubmitting(true);
        try {
            const token = await getAccessToken();
            if (editingLocation) {
                // Cập nhật
                const updatedLoc = await updateSupportLocation(
                    token,
                    editingLocation.id,
                    payload,
                );
                setLocations((prev) =>
                    prev.map((loc) =>
                        loc.id === editingLocation.id ? updatedLoc : loc,
                    ),
                );
            } else {
                // Tạo mới
                const newLoc = await createSupportLocation(token, payload);
                setLocations((prev) => [newLoc, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            alert(`Thao tác thất bại: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setEditingLocation(null);
        setIsModalOpen(true);
    };

    const openEditModal = (location: SupportLocation) => {
        setEditingLocation(location);
        setIsModalOpen(true);
    };

    return (
        <>
            <PageHeading
                eyebrow="Cơ sở hạ tầng"
                title="Trạm tiếp nhận hỗ trợ"
                description="Quản lý các trạm tiếp nhận, kho bãi và điểm tập kết hàng hóa nhu yếu phẩm."
                action={
                    <button
                        onClick={openCreateModal}
                        className="inline-flex h-11 items-center rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-[0_4px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                    >
                        + Thêm trạm mới
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
                        <LoadingBlock message="Đang tải danh sách trạm..." />
                    </div>
                ) : locations.length === 0 ? (
                    <div className="py-8 border-t border-slate-100">
                        <EmptyState
                            title="Chưa có trạm tiếp nhận nào"
                            description="Tạo trạm tiếp nhận đầu tiên để điều phối nguồn lực hỗ trợ."
                        />
                    </div>
                ) : (
                    <SupportLocationTable
                        locations={locations}
                        processingId={processingId}
                        onEdit={openEditModal}
                        onToggleStatus={handleToggleStatus}
                    />
                )}
            </div>

            <SupportLocationFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveLocation}
                initialData={editingLocation}
                isSubmitting={isSubmitting}
            />
        </>
    );
}
