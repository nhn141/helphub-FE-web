"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { SupportLocationFormModal } from "@/components/admin/support-location-form-modal";
import { SupportLocationTable } from "@/components/admin/support-location-table";
import {
    EmptyState,
    LoadingBlock,
    Notice,
    PageHeading,
} from "@/components/support-ui";
import {
    createSupportLocation,
    getAdminSupportLocations,
    patchSupportLocationStatus,
    updateSupportLocation,
    type SupportLocation,
} from "@/lib/admin-api";

export function SupportLocationsClient() {
    const { profile, getAccessToken } = useAuth();
    const [locations, setLocations] = useState<SupportLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingLocation, setEditingLocation] =
        useState<SupportLocation | null>(null);

    const canManage =
        profile.role === "ADMIN" || profile.role === "COLLABORATOR";

    const fetchLocations = useCallback(async () => {
        if (!canManage) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await getAccessToken();
            const data = await getAdminSupportLocations(token, false);
            setLocations(data);
        } catch (loadError) {
            setError(getErrorMessage(loadError));
        } finally {
            setLoading(false);
        }
    }, [canManage, getAccessToken]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchLocations();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [fetchLocations]);

    if (!canManage) {
        return (
            <Notice type="error">
                Chỉ Quản trị viên và Điều phối viên mới có quyền quản lý trạm tiếp nhận hỗ trợ.
            </Notice>
        );
    }

    const openCreateModal = () => {
        setEditingLocation(null);
        setIsModalOpen(true);
    };

    const openEditModal = (location: SupportLocation) => {
        setEditingLocation(location);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? "ngừng hoạt động" : "kích hoạt lại";

        if (
            !window.confirm(
                `Bạn có chắc chắn muốn ${action} trạm tiếp nhận hỗ trợ này?`,
            )
        ) {
            return;
        }

        setProcessingId(id);
        setError(null);
        setSuccess(null);

        try {
            const token = await getAccessToken();
            await patchSupportLocationStatus(token, id, {
                isActive: !currentStatus,
            });
            setLocations((current) =>
                current.map((location) =>
                    location.id === id
                        ? { ...location, isActive: !currentStatus }
                        : location,
                ),
            );
            setSuccess(
                `Đã ${currentStatus ? "ngừng hoạt động" : "kích hoạt"
                } trạm tiếp nhận thành công.`,
            );
        } catch (statusError) {
            setError(getErrorMessage(statusError));
        } finally {
            setProcessingId(null);
        }
    };

    const handleSaveLocation = async (
        payload: Omit<SupportLocation, "id" | "isActive" | "createdAt">,
    ) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const token = await getAccessToken();

            if (editingLocation) {
                const updatedLocation = await updateSupportLocation(
                    token,
                    editingLocation.id,
                    payload,
                );
                setLocations((current) =>
                    current.map((location) =>
                        location.id === editingLocation.id
                            ? updatedLocation
                            : location,
                    ),
                );
                setSuccess("Đã cập nhật thông tin trạm tiếp nhận thành công.");
            } else {
                const newLocation = await createSupportLocation(token, payload);
                setLocations((current) => [newLocation, ...current]);
                setSuccess("Đã tạo trạm tiếp nhận mới thành công.");
            }

            setIsModalOpen(false);
            setEditingLocation(null);
        } catch (saveError) {
            setError(getErrorMessage(saveError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeading
                eyebrow="Trạm tiếp nhận"
                title="Quản lý trạm tiếp nhận hỗ trợ"
                description="Thiết lập các trạm, kho lưu trữ và điểm tập kết nguồn lực để điều phối cho các yêu cầu hỗ trợ đã duyệt."
                action={
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-11 items-center rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-[0_4px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                    >
                        + Thêm trạm mới
                    </button>
                }
            />

            {error ? <Notice type="error">{error}</Notice> : null}
            {success ? <Notice type="success">{success}</Notice> : null}

            <section className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="py-10">
                        <LoadingBlock message="Đang tải danh sách trạm tiếp nhận..." />
                    </div>
                ) : locations.length ? (
                    <SupportLocationTable
                        locations={locations}
                        processingId={processingId}
                        onEdit={openEditModal}
                        onToggleStatus={handleToggleStatus}
                    />
                ) : (
                    <div className="border-t border-slate-100 py-8">
                        <EmptyState
                            title="Chưa có trạm tiếp nhận nào"
                            description="Tạo trạm tiếp nhận đầu tiên để điều phối viên có thể chỉ định trạm cho các yêu cầu đã phê duyệt."
                        />
                    </div>
                )}
            </section>

            <SupportLocationFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingLocation(null);
                }}
                onSave={handleSaveLocation}
                initialData={editingLocation}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

function getErrorMessage(error: unknown) {
    return error instanceof Error
        ? error.message
        : "Không thể cập nhật thông tin trạm tiếp nhận.";
}
