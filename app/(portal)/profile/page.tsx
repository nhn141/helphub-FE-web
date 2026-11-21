"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import {
    getMyProfile,
    updateMyProfile,
    UserProfileResponse,
    UpdateProfileRequest,
    getMyRoleUpgradeRequests,
    createRoleUpgradeRequest,
    RoleUpgradeRequestResponse,
} from "@/lib/user-api";

export default function ProfilePage() {
    const { getAccessToken } = useAuth();

    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<UpdateProfileRequest>({
        fullName: "",
        phone: "",
        avatarUrl: "",
    });

    const [upgradeRequests, setUpgradeRequests] = useState<
        RoleUpgradeRequestResponse[]
    >([]);
    const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState("");
    const [upgradeDocsUrl, setUpgradeDocsUrl] = useState("");
    const [upgradeError, setUpgradeError] = useState<string | null>(null);
    const [showUpgradeForm, setShowUpgradeForm] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchInitialData() {
            try {
                const token = await getAccessToken();
                if (!token) return;

                const profileData = await getMyProfile(token);
                if (isMounted) {
                    setProfile(profileData);
                    setFormData({
                        fullName: profileData.fullName || "",
                        phone: profileData.phone || "",
                        avatarUrl: profileData.avatarUrl || "",
                    });
                }

                const requestsData = await getMyRoleUpgradeRequests(token);
                if (isMounted && requestsData.content) {
                    setUpgradeRequests(requestsData.content);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setError("Không thể tải thông tin hồ sơ.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, [getAccessToken]);

    const handleAvatarUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        setError(null);

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset =
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                throw new Error("Chưa cấu hình Cloudinary.");
            }

            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("upload_preset", uploadPreset);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: uploadData,
                },
            );

            if (!res.ok) throw new Error("Không thể tải ảnh lên");

            const data = await res.json();
            setFormData((prev) => ({ ...prev, avatarUrl: data.secure_url }));
        } catch (err: any) {
            console.error(err);
            setError(
                "Tải ảnh lên thất bại. Vui lòng kiểm tra lại kết nối mạng.",
            );
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName.trim()) {
            setError("Họ và tên không được để trống.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const token = await getAccessToken();
            const updatedProfile = await updateMyProfile(token, {
                fullName: formData.fullName.trim(),
                phone: formData.phone?.trim() || null,
                avatarUrl: formData.avatarUrl?.trim() || null,
            });

            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (err: any) {
            console.error(err);
            setError(
                err.message || "Cập nhật hồ sơ thất bại. Vui lòng thử lại.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!upgradeReason.trim()) {
            setUpgradeError("Vui lòng nhập lý do xin nâng cấp vai trò.");
            return;
        }

        setIsSubmittingUpgrade(true);
        setUpgradeError(null);

        try {
            const token = await getAccessToken();
            const newRequest = await createRoleUpgradeRequest(token, {
                reason: upgradeReason.trim(),
                supportingDocumentsUrl: upgradeDocsUrl.trim() || null,
            });

            setUpgradeRequests((prev) => [newRequest, ...prev]);
            setShowUpgradeForm(false);
            setUpgradeReason("");
            setUpgradeDocsUrl("");
        } catch (err: any) {
            console.error(err);
            setUpgradeError(err.message || "Gửi yêu cầu nâng cấp thất bại.");
        } finally {
            setIsSubmittingUpgrade(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 text-center text-slate-500 font-bold">
                Không tìm thấy thông tin hồ sơ người dùng.
            </div>
        );
    }

    const displayAvatar = isEditing ? formData.avatarUrl : profile.avatarUrl;
    const hasPendingRequest = upgradeRequests.some(
        (req) => req.status === "PENDING",
    );

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900">
                    Hồ sơ cá nhân
                </h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                    Quản lý thông tin tài khoản và phân quyền của bạn trên HelpHub.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border-2 border-rose-200 text-rose-800 rounded-2xl text-sm font-bold shadow-[0_2px_0_0_#fecdd3]">
                    {error}
                </div>
            )}

            <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-8 border-b-2 border-slate-200 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative size-24 rounded-full bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-emerald-800 overflow-hidden shrink-0">
                        {displayAvatar ? (
                            <img
                                src={displayAvatar}
                                alt="Ảnh đại diện"
                                className="size-full object-cover"
                            />
                        ) : (
                            profile.fullName.charAt(0).toUpperCase()
                        )}
                        {isUploadingAvatar && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-xl font-black text-slate-900">
                            {profile.fullName}
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mb-2">
                            {profile.email}
                        </p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {profile.role === "REQUESTER" ? "Người cần hỗ trợ" : profile.role === "VOLUNTEER" ? "Tình nguyện viên" : profile.role === "ADMIN" ? "Quản trị viên" : "Cộng tác viên"}
                        </span>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-700 hover:border-emerald-400 hover:text-emerald-700 transition shadow-[0_2px_0_0_#cbd5e1] active:translate-y-0.5 active:shadow-none cursor-pointer"
                        >
                            Chỉnh sửa hồ sơ
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {isEditing ? (
                        <form
                            onSubmit={handleSaveProfile}
                            className="space-y-5"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Họ và tên{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isSaving}
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fullName: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium text-sm transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Địa chỉ Email
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profile.email}
                                        className="w-full px-4 py-2.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Số điện thoại liên hệ
                                    </label>
                                    <input
                                        type="tel"
                                        disabled={isSaving}
                                        placeholder="0912 345 678"
                                        value={formData.phone || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium text-sm transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Ảnh đại diện
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            disabled={
                                                isSaving || isUploadingAvatar
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={
                                                isSaving || isUploadingAvatar
                                            }
                                            className="px-4 py-2.5 w-full bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                        >
                                            {isUploadingAvatar
                                                ? "Đang tải ảnh lên..."
                                                : "Chọn ảnh từ thiết bị"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setError(null);
                                        setFormData({
                                            fullName: profile.fullName || "",
                                            phone: profile.phone || "",
                                            avatarUrl: profile.avatarUrl || "",
                                        });
                                    }}
                                    disabled={isSaving || isUploadingAvatar}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        isSaving ||
                                        isUploadingAvatar ||
                                        !formData.fullName.trim()
                                    }
                                    className="px-5 py-2.5 text-sm font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 active:shadow-none transition flex items-center gap-2 cursor-pointer"
                                >
                                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Họ và tên
                                    </h3>
                                    <p className="text-slate-900 font-bold">
                                        {profile.fullName}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Địa chỉ Email
                                    </h3>
                                    <p className="text-slate-900 font-bold">
                                        {profile.email}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Số điện thoại liên hệ
                                    </h3>
                                    <p className="text-slate-900 font-bold">
                                        {profile.phone || (
                                            <span className="text-slate-400 italic font-normal">
                                                Chưa cập nhật
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Ngày tham gia
                                    </h3>
                                    <p className="text-slate-900 font-bold">
                                        {new Date(
                                            profile.createdAt,
                                        ).toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Trạng thái tài khoản
                                    </h3>
                                    <div className="mt-1">
                                        {profile.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <span className="size-2 rounded-full bg-emerald-500"></span>
                                                Đang hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                <span className="size-2 rounded-full bg-rose-500"></span>
                                                Ngưng hoạt động
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b-2 border-slate-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">
                            Quản lý vai trò & Phân quyền
                        </h2>
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                            Xem vai trò hiện tại hoặc gửi yêu cầu nâng cấp quyền hạn tài khoản.
                        </p>
                    </div>
                    {profile.role === "VOLUNTEER" &&
                        !hasPendingRequest &&
                        !showUpgradeForm && (
                            <button
                                onClick={() => setShowUpgradeForm(true)}
                                className="px-4 py-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-black text-xs rounded-xl hover:bg-emerald-100 transition shadow-[0_2px_0_0_#a7f3d0] cursor-pointer"
                            >
                                + Yêu cầu nâng cấp
                            </button>
                        )}
                </div>

                <div className="p-6">
                    {showUpgradeForm ? (
                        <form
                            onSubmit={handleUpgradeSubmit}
                            className="space-y-4 mb-8 bg-slate-50 p-5 rounded-2xl border-2 border-slate-200"
                        >
                            <h3 className="font-black text-slate-900">
                                Gửi yêu cầu nâng cấp vai trò
                            </h3>
                            {upgradeError && (
                                <div className="p-3 bg-rose-50 text-rose-800 text-sm font-bold rounded-xl border border-rose-200">
                                    {upgradeError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Lý do xin nâng cấp vai trò{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    disabled={isSubmittingUpgrade}
                                    value={upgradeReason}
                                    onChange={(e) =>
                                        setUpgradeReason(e.target.value)
                                    }
                                    placeholder="Nêu rõ kinh nghiệm hoặc lý do bạn mong muốn nâng cấp vai trò..."
                                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Đường dẫn tài liệu chứng minh (nếu có)
                                </label>
                                <input
                                    type="url"
                                    disabled={isSubmittingUpgrade}
                                    value={upgradeDocsUrl}
                                    onChange={(e) =>
                                        setUpgradeDocsUrl(e.target.value)
                                    }
                                    placeholder="https://link-chung-chi-hoac-ho-so.com"
                                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpgradeForm(false);
                                        setUpgradeError(null);
                                    }}
                                    disabled={isSubmittingUpgrade}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        isSubmittingUpgrade ||
                                        !upgradeReason.trim()
                                    }
                                    className="px-5 py-2 text-sm font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-[0_3px_0_0_#065f46] transition cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingUpgrade
                                        ? "Đang gửi..."
                                        : "Gửi yêu cầu"}
                                </button>
                            </div>
                        </form>
                    ) : null}

                    {upgradeRequests.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                                Lịch sử yêu cầu nâng cấp
                            </h3>
                            {upgradeRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="p-4 border-2 border-slate-200 rounded-2xl bg-white shadow-xs"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-slate-500 font-bold">
                                            {new Date(
                                                req.createdAt,
                                            ).toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                        <span
                                            className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${
                                                req.status === "APPROVED"
                                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                    : req.status === "REJECTED"
                                                      ? "bg-rose-50 text-rose-800 border-rose-200"
                                                      : req.status ===
                                                          "CANCELLED"
                                                        ? "bg-slate-100 text-slate-600 border-slate-200"
                                                        : "bg-amber-50 text-amber-800 border-amber-200"
                                            }`}
                                        >
                                            {req.status === "APPROVED" ? "Đã duyệt" : req.status === "REJECTED" ? "Từ chối" : req.status === "CANCELLED" ? "Đã hủy" : "Đang chờ duyệt"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-800 font-medium">
                                        <span className="font-bold text-slate-600">
                                            Lý do:
                                        </span>{" "}
                                        {req.reason}
                                    </p>
                                    {req.supportingDocumentsUrl && (
                                        <a
                                            href={req.supportingDocumentsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-emerald-600 font-bold hover:underline mt-1.5 block truncate"
                                        >
                                            Xem tài liệu chứng minh đính kèm &rarr;
                                        </a>
                                    )}
                                    {req.rejectionReason && (
                                        <div className="mt-3 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 font-medium">
                                            <span className="font-bold">
                                                Lý do từ chối:
                                            </span>{" "}
                                            {req.rejectionReason}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm font-semibold text-slate-400 text-center py-4">
                            Chưa có yêu cầu nâng cấp vai trò nào.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
