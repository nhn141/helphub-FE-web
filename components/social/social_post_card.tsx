"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Heart,
    MessageCircle,
    Send,
    Share2,
    Check,
    Globe,
    Lock,
    Edit3,
    Trash2,
    Flag,
    HeartHandshake,
    ArrowUpRight,
    Loader2,
    AlertTriangle,
} from "lucide-react";

import {
    PostSummaryResponse,
    PostMedia,
    ReactionCount,
    PostReactionType,
    getPostMedia,
    getReactionCount,
    getMyReaction,
    reactToPost,
    removeReaction,
    deletePost,
    PostVisibility,
    updatePost,
} from "@/lib/social-api";
import { SocialCommentSection } from "./social_comment_section";
import { useAuth } from "../auth-provider";
import { ReportModal } from "../report-modal";
import { getOrCreatePrivateConversation } from "@/lib/chat-api";

interface SocialPostCardProps {
    post: PostSummaryResponse;
    accessToken: string;
    onDelete?: () => void;
}

export function SocialPostCard({
    post,
    accessToken,
    onDelete,
}: SocialPostCardProps) {
    const { profile } = useAuth();
    const router = useRouter();
    const [media, setMedia] = useState<PostMedia[]>([]);
    const [reactionCount, setReactionCount] = useState<ReactionCount | null>(
        null,
    );
    const [myReaction, setMyReaction] = useState<PostReactionType | null>(null);
    const [showComments, setShowComments] = useState(false);

    const [isLoadingExtras, setIsLoadingExtras] = useState(true);
    const [isReacting, setIsReacting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [editVisibility, setEditVisibility] = useState<PostVisibility>(
        post.visibility,
    );
    const [isUpdating, setIsUpdating] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isReportUserModalOpen, setIsReportUserModalOpen] = useState(false);

    const [isStartingChat, setIsStartingChat] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const isAuthor = profile?.id === post.authorId;

    useEffect(() => {
        let isMounted = true;

        async function fetchExtraData() {
            if (!accessToken) return;
            try {
                const [mediaData, reactionData, myReactionData] =
                    await Promise.all([
                        getPostMedia(accessToken, post.id).catch(() => []),
                        getReactionCount(accessToken, post.id).catch(
                            () => null,
                        ),
                        getMyReaction(accessToken, post.id).catch(() => null),
                    ]);

                if (isMounted) {
                    setMedia(mediaData);
                    setReactionCount(reactionData);
                    setMyReaction(myReactionData ? myReactionData.type : null);
                }
            } catch (error) {
                console.error("Failed to fetch post extras:", error);
            } finally {
                if (isMounted) setIsLoadingExtras(false);
            }
        }

        fetchExtraData();

        return () => {
            isMounted = false;
        };
    }, [post.id, accessToken]);

    const toggleReaction = async () => {
        if (isReacting) return;

        setIsReacting(true);

        const previousReaction = myReaction;
        const previousCount = reactionCount?.totalCount || 0;

        try {
            if (myReaction) {
                setMyReaction(null);
                setReactionCount((prev) =>
                    prev
                        ? {
                              ...prev,
                              totalCount: Math.max(0, prev.totalCount - 1),
                          }
                        : null,
                );

                await removeReaction(accessToken, post.id);
            } else {
                setMyReaction("LIKE");
                setReactionCount((prev) =>
                    prev
                        ? { ...prev, totalCount: prev.totalCount + 1 }
                        : {
                              postId: post.id,
                              totalCount: 1,
                              countByType: {
                                  LIKE: 1,
                                  LOVE: 0,
                                  CARE: 0,
                                  SAD: 0,
                                  WOW: 0,
                              },
                          },
                );

                await reactToPost(accessToken, post.id, "LIKE");
            }
        } catch (error) {
            console.error("Reaction failed:", error);
            setMyReaction(previousReaction);
            if (reactionCount) {
                setReactionCount({
                    ...reactionCount,
                    totalCount: previousCount,
                });
            }
        } finally {
            setIsReacting(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Bạn có chắc chắn muốn xóa bài viết này?",
        );
        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            await deletePost(accessToken, post.id);
            if (onDelete) onDelete();
        } catch (error: any) {
            console.error("Failed to delete post:", error);
            alert("Không thể xóa bài viết. Vui lòng thử lại!");
            setIsDeleting(false);
        }
    };

    const handleStartChat = async () => {
        if (isAuthor) return;
        setIsStartingChat(true);
        try {
            const conv = await getOrCreatePrivateConversation(
                accessToken,
                post.authorId,
            );
            router.push(`/messages?convId=${conv.id}`);
        } catch (error) {
            console.error("Failed to start chat:", error);
            alert("Không thể bắt đầu cuộc trò chuyện.");
        } finally {
            setIsStartingChat(false);
        }
    };

    const handleCopyShare = async () => {
        try {
            const url = `${window.location.origin}/social#post-${post.id}`;
            await navigator.clipboard.writeText(url);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            console.error("Failed to copy link", err);
        }
    };

    const handleUpdate = async () => {
        if (
            !editContent.trim() ||
            (editContent === post.content && editVisibility === post.visibility)
        ) {
            setIsEditing(false);
            return;
        }

        setIsUpdating(true);
        try {
            await updatePost(accessToken, post.id, {
                content: editContent.trim(),
                visibility: editVisibility,
                supportRequestId: post.supportRequestId,
            });

            if (onDelete) onDelete();
            setIsEditing(false);
        } catch (error: any) {
            console.error("Failed to update post:", error);
            alert("Không thể cập nhật bài viết. Vui lòng thử lại!");
        } finally {
            setIsUpdating(false);
        }
    };

    const authorInitial = post.authorName
        ? post.authorName.trim().charAt(0).toUpperCase()
        : "U";

    const formattedDate = new Date(post.createdAt).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <article
            id={`post-${post.id}`}
            className="rounded-3xl border-2 border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all duration-200"
        >
            <div className="flex gap-3.5">
                {/* Left Column: Author Avatar Duolingo style */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-100 text-sm font-black text-emerald-900 shadow-[0_2px_0_0_#a7f3d0] overflow-hidden">
                    {post.authorAvatarUrl ? (
                        <img
                            src={post.authorAvatarUrl}
                            alt={post.authorName}
                            className="size-full object-cover"
                        />
                    ) : (
                        <span>{authorInitial}</span>
                    )}
                </div>

                {/* Right Column: Twitter-style Content Stream */}
                <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            <span className="font-black text-slate-900 text-sm hover:text-emerald-700 transition truncate">
                                {post.authorName}
                            </span>
                            <span className="text-slate-400 text-xs font-semibold">
                                ·
                            </span>
                            <time
                                className="text-xs font-semibold text-slate-500"
                                title={post.createdAt}
                            >
                                {formattedDate}
                            </time>
                            <span className="text-slate-400 text-xs font-semibold">
                                ·
                            </span>
                            <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500"
                                title={
                                    post.visibility === "PUBLIC"
                                        ? "Công khai"
                                        : "Chỉ tình nguyện viên"
                                }
                            >
                                {post.visibility === "PUBLIC" ? (
                                    <>
                                        <Globe className="size-3 text-emerald-600" />
                                        <span className="hidden sm:inline">Công khai</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="size-3 text-amber-600" />
                                        <span className="hidden sm:inline">Tình nguyện</span>
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Top-Right Menu & Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                            {isAuthor ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        disabled={isDeleting || isUpdating}
                                        title="Chỉnh sửa bài viết"
                                        className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                                    >
                                        <Edit3 className="size-4" />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting || isUpdating}
                                        title="Xóa bài viết"
                                        className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsReportUserModalOpen(true)}
                                        className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                                        title={`Báo cáo người dùng: ${post.authorName}`}
                                    >
                                        <AlertTriangle className="size-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        title="Báo cáo bài viết"
                                        className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    >
                                        <Flag className="size-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Post Content */}
                    {isEditing ? (
                        <div className="mt-3 space-y-2 rounded-2xl border-2 border-slate-200 bg-slate-50 p-3">
                            <textarea
                                className="w-full resize-none rounded-xl border-2 border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 focus:border-emerald-400 focus:outline-none"
                                rows={3}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                disabled={isUpdating}
                            />
                            <div className="flex items-center justify-between gap-2">
                                <select
                                    value={editVisibility}
                                    onChange={(e) =>
                                        setEditVisibility(
                                            e.target.value as PostVisibility,
                                        )
                                    }
                                    disabled={isUpdating}
                                    className="rounded-xl border-2 border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700"
                                >
                                    <option value="PUBLIC">Công khai</option>
                                    <option value="VOLUNTEERS_ONLY">
                                        Chỉ tình nguyện viên
                                    </option>
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditContent(post.content);
                                            setEditVisibility(post.visibility);
                                        }}
                                        disabled={isUpdating}
                                        className="rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={isUpdating || !editContent.trim()}
                                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white shadow-[0_2px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                                    >
                                        {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-2 text-slate-800 text-[15px] font-normal leading-relaxed whitespace-pre-wrap break-words">
                            {post.content}
                        </p>
                    )}

                    {/* Attached Support Request (Twitter Quote Tweet Card style) */}
                    {post.supportRequestId && post.supportRequestTitle && !isEditing && (
                        <Link
                            href={`/support-requests/${post.supportRequestId}`}
                            className="mt-3 group/campaign flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-3.5 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all shadow-2xs"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover/campaign:bg-emerald-200 transition">
                                    <HeartHandshake className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                                        Chiến dịch gắn kèm
                                    </p>
                                    <p className="truncate text-sm font-black text-slate-900 group-hover/campaign:text-emerald-800 transition">
                                        {post.supportRequestTitle}
                                    </p>
                                </div>
                            </div>
                            <ArrowUpRight className="size-4 shrink-0 text-slate-400 group-hover/campaign:text-emerald-700 group-hover/campaign:translate-x-0.5 group-hover/campaign:-translate-y-0.5 transition" />
                        </Link>
                    )}

                    {/* Media Gallery (Twitter style) */}
                    {isLoadingExtras ? (
                        <div className="mt-3 h-24 animate-pulse rounded-2xl bg-slate-100" />
                    ) : (
                        media.length > 0 && (
                            <div
                                className={`mt-3 grid gap-1.5 overflow-hidden rounded-2xl border-2 border-slate-200/80 ${
                                    media.length === 1
                                        ? "grid-cols-1"
                                        : media.length === 2
                                          ? "grid-cols-2 h-60 sm:h-72"
                                          : media.length === 3
                                            ? "grid-cols-2 h-72 sm:h-80"
                                            : "grid-cols-2 h-72 sm:h-80"
                                }`}
                            >
                                {media.map((item, index) => {
                                    let imgWrapperClass =
                                        "relative overflow-hidden bg-slate-100 cursor-pointer group/img";

                                    if (media.length === 1) {
                                        imgWrapperClass += " max-h-[500px]";
                                    } else if (
                                        media.length === 3 &&
                                        index === 0
                                    ) {
                                        imgWrapperClass += " row-span-2";
                                    }

                                    return (
                                        <div
                                            key={
                                                item.id
                                                    ? `${item.id}-${index}`
                                                    : `media-${index}`
                                            }
                                            className={imgWrapperClass}
                                        >
                                            <img
                                                src={item.fileUrl}
                                                alt={
                                                    item.fileName ||
                                                    `Post image ${index + 1}`
                                                }
                                                className="size-full object-cover transition duration-300 group-hover/img:scale-102"
                                                loading="lazy"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* Twitter Action Bar */}
                    <div className="mt-3.5 flex items-center justify-between border-t-2 border-slate-100 pt-3 text-slate-500">
                        {/* 1. Comment Action */}
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="group/btn flex items-center gap-2 text-xs font-bold transition cursor-pointer"
                            title="Bình luận"
                        >
                            <span
                                className={`flex size-8 items-center justify-center rounded-full transition ${
                                    showComments
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "group-hover/btn:bg-emerald-50 group-hover/btn:text-emerald-600"
                                }`}
                            >
                                <MessageCircle className="size-4" />
                            </span>
                            <span
                                className={`${
                                    showComments
                                        ? "text-emerald-700"
                                        : "group-hover/btn:text-emerald-600"
                                }`}
                            >
                                Bình luận
                            </span>
                        </button>

                        {/* 2. Reaction / Like Action */}
                        <button
                            onClick={toggleReaction}
                            disabled={isReacting}
                            className="group/btn flex items-center gap-2 text-xs font-bold transition cursor-pointer"
                            title="Yêu thích"
                        >
                            <span
                                className={`flex size-8 items-center justify-center rounded-full transition ${
                                    myReaction
                                        ? "bg-rose-100 text-rose-600 scale-105"
                                        : "group-hover/btn:bg-rose-50 group-hover/btn:text-rose-600"
                                }`}
                            >
                                <Heart
                                    className={`size-4 transition ${
                                        myReaction
                                            ? "fill-rose-600 text-rose-600"
                                            : ""
                                    }`}
                                />
                            </span>
                            <span
                                className={`${
                                    myReaction
                                        ? "text-rose-600"
                                        : "group-hover/btn:text-rose-600"
                                }`}
                            >
                                {reactionCount?.totalCount || 0}
                            </span>
                        </button>

                        {/* 3. Direct Message Action */}
                        {!isAuthor ? (
                            <button
                                onClick={handleStartChat}
                                disabled={isStartingChat}
                                className="group/btn flex items-center gap-2 text-xs font-bold transition cursor-pointer"
                                title={`Nhắn tin cho ${post.authorName}`}
                            >
                                <span className="flex size-8 items-center justify-center rounded-full transition group-hover/btn:bg-emerald-50 group-hover/btn:text-emerald-600">
                                    {isStartingChat ? (
                                        <Loader2 className="size-4 animate-spin text-emerald-600" />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                </span>
                                <span className="hidden sm:inline group-hover/btn:text-emerald-600">
                                    Nhắn tin
                                </span>
                            </button>
                        ) : (
                            <div className="w-8" />
                        )}

                        {/* 4. Share / Copy Link Action */}
                        <button
                            onClick={handleCopyShare}
                            className="group/btn flex items-center gap-2 text-xs font-bold transition cursor-pointer"
                            title="Sao chép liên kết bài viết"
                        >
                            <span
                                className={`flex size-8 items-center justify-center rounded-full transition ${
                                    copiedLink
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "group-hover/btn:bg-emerald-50 group-hover/btn:text-emerald-600"
                                }`}
                            >
                                {copiedLink ? (
                                    <Check className="size-4 text-emerald-700" />
                                ) : (
                                    <Share2 className="size-4" />
                                )}
                            </span>
                            <span
                                className={`hidden sm:inline ${
                                    copiedLink
                                        ? "text-emerald-700"
                                        : "group-hover/btn:text-emerald-600"
                                }`}
                            >
                                {copiedLink ? "Đã chép!" : "Chia sẻ"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Comment Section (Twitter thread style) */}
            {showComments && (
                <div className="mt-4 pt-3 border-t-2 border-slate-100">
                    <SocialCommentSection
                        postId={post.id}
                        accessToken={accessToken}
                        postAuthorId={post.authorId}
                    />
                </div>
            )}

            {/* Modals */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetId={post.id}
                targetType="POST"
                title={`Bài viết của ${post.authorName}`}
            />

            <ReportModal
                isOpen={isReportUserModalOpen}
                onClose={() => setIsReportUserModalOpen(false)}
                targetId={post.authorId}
                targetType="USER"
                title={`Người dùng: ${post.authorName}`}
            />
        </article>
    );
}
