"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, Trash2, Edit3, X, Check } from "lucide-react";
import {
    PostComment,
    getPostComments,
    createPostComment,
    deletePostComment,
    updatePostComment,
} from "@/lib/social-api";
import { useAuth } from "../auth-provider";

interface SocialCommentSectionProps {
    postId: string;
    accessToken: string;
    postAuthorId: string;
}

export function SocialCommentSection({
    postId,
    accessToken,
    postAuthorId,
}: SocialCommentSectionProps) {
    const { profile } = useAuth();
    const [comments, setComments] = useState<PostComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchComments() {
            try {
                const data = await getPostComments(accessToken, postId);
                const patchedData = data.map((comment) => {
                    const assumedAuthorId = comment.authorId || profile?.id;

                    return {
                        ...comment,
                        authorId: assumedAuthorId,
                        authorName:
                            comment.authorName ||
                            (assumedAuthorId === profile?.id
                                ? profile?.fullName
                                : "Thành viên HelpHub"),
                        authorAvatarUrl:
                            comment.authorAvatarUrl ||
                            (assumedAuthorId === profile?.id
                                ? profile?.avatarUrl
                                : null),
                    };
                });
                if (isMounted) setComments(patchedData);
            } catch (error) {
                console.error("Failed to load comments:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        fetchComments();
        return () => {
            isMounted = false;
        };
    }, [postId, accessToken, profile]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const addedComment = await createPostComment(accessToken, postId, {
                content: newComment.trim(),
                parentCommentId: null,
            });

            const patchedComment = {
                ...addedComment,
                authorId: profile?.id || addedComment.authorId,
                authorName:
                    addedComment.authorName ||
                    profile?.fullName ||
                    "Thành viên HelpHub",
                authorAvatarUrl:
                    addedComment.authorAvatarUrl || profile?.avatarUrl || null,
                createdAt: addedComment.createdAt || new Date().toISOString(),
            };

            setComments((prev) => [patchedComment, ...prev]);
            setNewComment("");
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        const confirmDelete = window.confirm("Bạn có muốn xóa bình luận này?");
        if (!confirmDelete) return;

        setProcessingId(commentId);
        try {
            await deletePostComment(accessToken, commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment:", error);
            alert("Không thể xóa bình luận.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleUpdate = async (commentId: string) => {
        if (!editContent.trim()) return;
        setProcessingId(commentId);
        try {
            await updatePostComment(accessToken, commentId, {
                content: editContent.trim(),
            });
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? { ...c, content: editContent.trim() }
                        : c,
                ),
            );
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update comment:", error);
            alert("Không thể cập nhật bình luận.");
        } finally {
            setProcessingId(null);
        }
    };

    const userInitial = profile?.fullName
        ? profile.fullName.trim().charAt(0).toUpperCase()
        : "U";

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-slate-400">
                <Loader2 className="size-4 animate-spin text-emerald-600" />
                <span>Đang tải các bình luận...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-1">
            {/* Inline Comment Composer Twitter style */}
            <form onSubmit={handleCreate} className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-100 text-xs font-black text-emerald-900 shadow-xs">
                    {profile?.avatarUrl ? (
                        <img
                            src={profile.avatarUrl}
                            alt={profile.fullName}
                            className="size-full rounded-xl object-cover"
                        />
                    ) : (
                        <span>{userInitial}</span>
                    )}
                </div>

                <div className="flex-1 relative flex items-center">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết câu trả lời của bạn..."
                        disabled={isSubmitting}
                        className="w-full rounded-full border-2 border-slate-200 bg-slate-50/80 px-4 py-2 pr-16 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none transition"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="absolute right-1.5 flex h-7 items-center gap-1 rounded-full bg-emerald-600 px-3 text-xs font-black text-white shadow-[0_2px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:shadow-none transition cursor-pointer"
                    >
                        {isSubmitting ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : (
                            <span>Gửi</span>
                        )}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
                <p className="py-2 text-center text-xs font-bold text-slate-400">
                    Chưa có bình luận nào. Hãy là người đầu tiên phản hồi!
                </p>
            ) : (
                <div className="space-y-3 pt-1">
                    {comments.map((comment) => {
                        const isCommentOwner = profile?.id === comment.authorId;
                        const canDelete =
                            isCommentOwner ||
                            profile?.id === postAuthorId ||
                            profile?.role === "ADMIN";
                        const isEditing = editingId === comment.id;

                        const commentAuthorInitial = (
                            comment.authorName || "U"
                        )
                            .trim()
                            .charAt(0)
                            .toUpperCase();

                        return (
                            <div
                                key={comment.id}
                                className="group flex gap-2.5 items-start"
                            >
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[11px] font-black text-slate-700 overflow-hidden mt-0.5">
                                    {comment.authorAvatarUrl ? (
                                        <img
                                            src={comment.authorAvatarUrl}
                                            alt={comment.authorName}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <span>{commentAuthorInitial}</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-3.5 py-2.5 inline-block max-w-full">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-black text-slate-900">
                                                {comment.authorName ||
                                                    "Thành viên HelpHub"}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                {new Date(
                                                    comment.createdAt,
                                                ).toLocaleDateString("vi-VN", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>

                                        {isEditing ? (
                                            <div className="mt-1.5 space-y-2">
                                                <input
                                                    type="text"
                                                    value={editContent}
                                                    onChange={(e) =>
                                                        setEditContent(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-emerald-400 focus:outline-none"
                                                    autoFocus
                                                />
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() =>
                                                            handleUpdate(
                                                                comment.id,
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            comment.id
                                                        }
                                                        className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                                                    >
                                                        <Check className="size-3" />
                                                        Lưu
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            comment.id
                                                        }
                                                        className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                                    >
                                                        <X className="size-3" />
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs font-normal text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                                                {comment.content}
                                            </p>
                                        )}
                                    </div>

                                    {!isEditing && (
                                        <div className="flex items-center gap-3 mt-1 ml-2 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isCommentOwner && (
                                                <button
                                                    onClick={() => {
                                                        setEditingId(
                                                            comment.id,
                                                        );
                                                        setEditContent(
                                                            comment.content,
                                                        );
                                                    }}
                                                    className="hover:text-sky-600 transition cursor-pointer"
                                                >
                                                    Sửa
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() =>
                                                        handleDelete(comment.id)
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        comment.id
                                                    }
                                                    className="hover:text-rose-600 transition cursor-pointer"
                                                >
                                                    {processingId === comment.id
                                                        ? "Đang xóa..."
                                                        : "Xóa"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
