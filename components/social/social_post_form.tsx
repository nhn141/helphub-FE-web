"use client";

import { useState, useEffect, useRef } from "react";
import {
    Image as ImageIcon,
    HeartHandshake,
    Globe,
    Lock,
    X,
    Loader2,
} from "lucide-react";
import {
    attachMediaToPost,
    createMediaRecord,
    createPost,
    PostVisibility,
} from "@/lib/social-api";
import { uploadMedia } from "@/lib/media-api";
import { useAuth } from "@/components/auth-provider";
import {
    getMySupportRequests,
    getSupportRequests,
    SupportRequestSummary,
} from "@/lib/api";

interface SocialPostFormProps {
    accessToken: string;
    onPostCreated: () => void;
}

export function SocialPostForm({
    accessToken,
    onPostCreated,
}: SocialPostFormProps) {
    const { profile } = useAuth();
    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState<PostVisibility>("PUBLIC");
    const [supportRequestId, setSupportRequestId] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [availableRequests, setAvailableRequests] = useState<
        SupportRequestSummary[]
    >([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [showCampaignPicker, setShowCampaignPicker] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchRequests() {
            if (!profile) return;
            setIsLoadingRequests(true);
            try {
                let requests: SupportRequestSummary[] = [];

                if (profile.role === "REQUESTER") {
                    requests = await getMySupportRequests(accessToken);
                } else {
                    requests = await getSupportRequests(accessToken);
                }

                const validStatuses = ["APPROVED", "IN_PROGRESS", "COMPLETED"];
                const validRequests = requests.filter((req) =>
                    validStatuses.includes(req.status),
                );

                if (isMounted) setAvailableRequests(validRequests);
            } catch (err) {
                console.error("Failed to fetch support requests:", err);
            } finally {
                if (isMounted) setIsLoadingRequests(false);
            }
        }

        fetchRequests();
        return () => {
            isMounted = false;
        };
    }, [profile, accessToken]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (selectedFiles.length + filesArray.length > 4) {
                alert("Bạn chỉ có thể tải lên tối đa 4 hình ảnh.");
                return;
            }
            setSelectedFiles((prev) => [...prev, ...filesArray]);

            const newPreviews = filesArray.map((file) =>
                URL.createObjectURL(file),
            );
            setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removePreview = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && selectedFiles.length === 0) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const newPost = await createPost(accessToken, {
                content: content.trim(),
                visibility,
                supportRequestId: supportRequestId ? supportRequestId : null,
            });

            if (selectedFiles.length > 0) {
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const uploadPreset =
                    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                if (!cloudName || !uploadPreset) {
                    throw new Error(
                        "Cấu hình Cloudinary chưa được thiết lập trong .env.",
                    );
                }

                let displayOrder = 0;

                for (const file of selectedFiles) {
                    try {
                        // Gọi media-service microservice tạo upload session và upload thật
                        const mediaResult = await uploadMedia(accessToken, file, "PUBLIC");
                        await attachMediaToPost(accessToken, newPost.id, {
                            mediaId: mediaResult.id,
                            displayOrder: displayOrder++,
                        });
                    } catch (uploadErr) {
                        console.warn("Media-service upload failed, falling back to direct Cloudinary preset:", uploadErr);
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("upload_preset", uploadPreset);

                        const res = await fetch(
                            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                            { method: "POST", body: formData },
                        );

                        if (!res.ok) {
                            throw new Error("Không thể tải ảnh lên Cloudinary.");
                        }
                        const cloudData = await res.json();

                        const mediaRecord = await createMediaRecord(accessToken, {
                            fileName: file.name,
                            fileUrl: cloudData.secure_url,
                            fileType: "IMAGE",
                            mimeType: file.type || "image/jpeg",
                            fileSize: file.size || cloudData.bytes,
                            altText: null,
                            isPublic: true,
                        });

                        await attachMediaToPost(accessToken, newPost.id, {
                            mediaId: mediaRecord.id,
                            displayOrder: displayOrder++,
                        });
                    }
                }
            }

            setContent("");
            setVisibility("PUBLIC");
            setSupportRequestId("");
            setSelectedFiles([]);
            setImagePreviews([]);
            setShowCampaignPicker(false);
            onPostCreated();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Đăng bài thất bại. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedRequestObj = availableRequests.find(
        (r) => r.id === supportRequestId,
    );

    const userInitial = profile?.fullName
        ? profile.fullName.trim().charAt(0).toUpperCase()
        : "U";

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-3xl border-2 border-slate-200/90 bg-white p-5 shadow-sm transition-all focus-within:border-emerald-400 focus-within:shadow-md"
        >
            <div className="flex gap-3.5">
                {/* Twitter-style Avatar on Left */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-100 text-sm font-black text-emerald-900 shadow-[0_2px_0_0_#a7f3d0]">
                    {profile?.avatarUrl ? (
                        <img
                            src={profile.avatarUrl}
                            alt={profile.fullName}
                            className="size-full rounded-2xl object-cover"
                        />
                    ) : (
                        <span>{userInitial}</span>
                    )}
                </div>

                {/* Right Composer Area */}
                <div className="flex-1 min-w-0">
                    <textarea
                        ref={textareaRef}
                        className="w-full resize-none border-none bg-transparent p-0 text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 leading-relaxed min-h-[72px]"
                        rows={3}
                        placeholder="Chuyện gì đang diễn ra? Hãy chia sẻ với cộng đồng HelpHub..."
                        value={content}
                        maxLength={2000}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isSubmitting}
                    />

                    {/* Attached Campaign Preview Badge */}
                    {selectedRequestObj ? (
                        <div className="mt-2 mb-3 inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-900 shadow-xs">
                            <HeartHandshake className="size-4 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-xs sm:max-w-md">
                                Chiến dịch: {selectedRequestObj.title}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSupportRequestId("")}
                                className="ml-1 text-emerald-600 hover:text-emerald-800 rounded-full hover:bg-emerald-200/60 p-0.5 transition cursor-pointer"
                                title="Gỡ đính kèm"
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                    ) : null}

                    {/* Image Previews Twitter style */}
                    {imagePreviews.length > 0 && (
                        <div
                            className={`mt-2 mb-3 grid gap-2 ${imagePreviews.length === 1
                                    ? "grid-cols-1"
                                    : "grid-cols-2"
                                }`}
                        >
                            {imagePreviews.map((url, index) => (
                                <div
                                    key={index}
                                    className="relative h-44 sm:h-52 overflow-hidden rounded-2xl border-2 border-slate-200 group bg-slate-50"
                                >
                                    <img
                                        src={url}
                                        alt={`Preview ${index}`}
                                        className="size-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePreview(index)}
                                        disabled={isSubmitting}
                                        className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-slate-900 transition backdrop-blur-xs cursor-pointer shadow-md"
                                        title="Xóa ảnh này"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div className="mt-2 mb-3 rounded-2xl border-2 border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                            {error}
                        </div>
                    )}

                    {/* Campaign Picker Dropdown */}
                    {showCampaignPicker && (
                        <div className="mt-2 mb-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-3">
                            <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                                Đính kèm chiến dịch hỗ trợ:
                            </label>
                            <select
                                value={supportRequestId}
                                onChange={(e) => {
                                    setSupportRequestId(e.target.value);
                                    if (e.target.value) setShowCampaignPicker(false);
                                }}
                                disabled={
                                    isSubmitting ||
                                    isLoadingRequests ||
                                    availableRequests.length === 0
                                }
                                className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-400 focus:outline-none"
                            >
                                <option value="">-- Không đính kèm chiến dịch --</option>
                                {availableRequests.map((req) => (
                                    <option key={req.id} value={req.id}>
                                        {req.title} ({req.status})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Bottom Twitter-style Action Toolbar */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-100 pt-3">
                        <div className="flex items-center gap-1.5">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                disabled={isSubmitting}
                            />

                            {/* Media Attachment Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSubmitting || selectedFiles.length >= 4}
                                className="flex size-9 items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-50 active:scale-95 transition disabled:opacity-40 cursor-pointer"
                                title="Đính kèm ảnh (tối đa 4 ảnh)"
                            >
                                <ImageIcon className="size-5" />
                            </button>

                            {/* Attach Support Request Button */}
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCampaignPicker(!showCampaignPicker)
                                }
                                disabled={isSubmitting || availableRequests.length === 0}
                                className={`flex size-9 items-center justify-center rounded-full transition cursor-pointer ${supportRequestId
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "text-emerald-600 hover:bg-emerald-50 active:scale-95"
                                    }`}
                                title="Đính kèm chiến dịch hỗ trợ"
                            >
                                <HeartHandshake className="size-5" />
                            </button>

                            {/* Audience / Visibility Selector Twitter Pill */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisibility(
                                            visibility === "PUBLIC"
                                                ? "VOLUNTEERS_ONLY"
                                                : "PUBLIC",
                                        )
                                    }
                                    disabled={isSubmitting}
                                    className="flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/70 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100/70 transition cursor-pointer"
                                    title="Chạm để chuyển chế độ hiển thị"
                                >
                                    {visibility === "PUBLIC" ? (
                                        <>
                                            <Globe className="size-3.5 text-emerald-600" />
                                            <span>Mọi người</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="size-3.5 text-amber-600" />
                                            <span>Tình nguyện viên</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Right: Character count + Duolingo-tactile Đăng bài button */}
                        <div className="flex items-center gap-3">
                            <span
                                className={`text-xs font-bold ${content.length > 1800
                                        ? "text-rose-600"
                                        : "text-slate-400"
                                    }`}
                            >
                                {content.length}/2000
                            </span>

                            <button
                                type="submit"
                                disabled={
                                    (content.trim() === "" &&
                                        selectedFiles.length === 0) ||
                                    isSubmitting
                                }
                                className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 text-sm font-black text-white shadow-[0_3px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>Đang đăng...</span>
                                    </>
                                ) : (
                                    <span>Đăng bài</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
