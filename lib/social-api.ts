import { apiData } from "./api";
import { uploadMedia, type UploadedMediaResult } from "./media-api";
import {
    getStoredPosts,
    addStoredPost,
    deleteStoredPost,
    getStoredComments,
    addStoredComment,
    deleteStoredCommentById,
    getStoredReactionCount,
    setStoredReaction,
} from "./data-store";

export { uploadMedia, type UploadedMediaResult };

export type PostVisibility = "PUBLIC" | "VOLUNTEERS_ONLY";
export type PostStatus = "ACTIVE" | "UNDER_REVIEW" | "HIDDEN" | "REMOVED";
export type PostReactionType = "LIKE" | "LOVE" | "CARE" | "SAD" | "WOW";
export type MediaFileType = "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";

export type PostSummaryResponse = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl: string | null;
    supportRequestId: string | null;
    supportRequestTitle: string | null;
    content: string;
    visibility: PostVisibility;
    status: PostStatus;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type SocialPost = PostSummaryResponse & {
    media?: PostMedia[];
    comments?: PostComment[];
    reactionCount?: ReactionCount;
    myReaction?: PostReactionType | null;
};

export type PostPayload = {
    content: string;
    visibility: PostVisibility;
    supportRequestId?: string | null;
};

export type PostMedia = {
    id: string;
    postId: string;
    mediaId: string;
    fileName: string;
    fileUrl: string;
    fileType: MediaFileType;
    mimeType: string;
    displayOrder: number;
};

export type CreateMediaPayload = {
    fileName: string;
    fileUrl: string;
    fileType: MediaFileType;
    mimeType: string;
    fileSize: number;
    altText: string | null;
    isPublic: boolean;
};

export type AttachMediaPayload = {
    mediaId: string;
    displayOrder: number;
};

export type PostComment = {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl: string | null;
    content: string;
    parentCommentId: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ReactionCount = {
    postId: string;
    totalCount: number;
    countByType: Record<PostReactionType, number>;
};

// ============================================================================
// DỮ LIỆU ĐỒNG BỘ: Kết nối kho dữ liệu thật (data-store) lưu trữ qua LocalStorage
// Bảng tin mạng xã hội khởi tạo trống, chỉ hiển thị bài viết và bình luận thật
// ============================================================================

export async function getPosts(accessToken: string): Promise<PostSummaryResponse[]> {
    return getStoredPosts();
}

export async function createPost(
    accessToken: string,
    payload: PostPayload,
): Promise<PostSummaryResponse> {
    const newPost: PostSummaryResponse = {
        id: "post-" + Date.now(),
        authorId: "me",
        authorName: "Bạn",
        authorAvatarUrl: null,
        supportRequestId: payload.supportRequestId ?? null,
        supportRequestTitle: null,
        content: payload.content,
        visibility: payload.visibility,
        status: "ACTIVE",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    addStoredPost(newPost);
    return newPost;
}

export async function deletePost(
    accessToken: string,
    postId: string,
): Promise<void> {
    deleteStoredPost(postId);
}

export async function getPostMedia(
    accessToken: string,
    postId: string,
): Promise<PostMedia[]> {
    return [];
}

export async function createMediaRecord(
    accessToken: string,
    payload: CreateMediaPayload,
): Promise<{ id: string }> {
    return { id: "media-" + Date.now() };
}

export async function attachMediaToPost(
    accessToken: string,
    postId: string,
    payload: AttachMediaPayload,
): Promise<void> {
    return Promise.resolve();
}

export async function getReactionCount(
    accessToken: string,
    postId: string,
): Promise<ReactionCount> {
    const data = getStoredReactionCount(postId);
    return {
        postId: data.postId,
        totalCount: data.totalCount,
        countByType: data.countByType,
    };
}

export async function getMyReaction(
    accessToken: string,
    postId: string,
): Promise<{ type: PostReactionType } | null> {
    const info = getStoredReactionCount(postId);
    return info.myReaction ? { type: info.myReaction } : null;
}

export async function reactToPost(
    accessToken: string,
    postId: string,
    type: PostReactionType,
): Promise<void> {
    setStoredReaction(postId, type);
}

export async function removeReaction(
    accessToken: string,
    postId: string,
): Promise<void> {
    setStoredReaction(postId, undefined);
}

export async function updateReaction(
    accessToken: string,
    postId: string,
    type: PostReactionType,
): Promise<void> {
    setStoredReaction(postId, type);
}

export async function getPostComments(
    accessToken: string,
    postId: string,
): Promise<PostComment[]> {
    return getStoredComments(postId);
}

export async function createPostComment(
    accessToken: string,
    postId: string,
    payload: { content: string; parentCommentId: string | null },
): Promise<PostComment> {
    const newComment: PostComment = {
        id: "comment-" + Date.now(),
        postId,
        authorId: "me",
        authorName: "Bạn",
        authorAvatarUrl: null,
        content: payload.content,
        parentCommentId: payload.parentCommentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    addStoredComment(postId, newComment);
    return newComment;
}

export async function deletePostComment(
    accessToken: string,
    commentId: string,
): Promise<void> {
    deleteStoredCommentById(commentId);
}

export async function updatePost(
    accessToken: string,
    postId: string,
    payload: PostPayload,
): Promise<PostSummaryResponse> {
    // [BE PENDING]: return apiData<PostSummaryResponse>(`/api/posts/${encodeURIComponent(postId)}`, { method: "PUT", body: JSON.stringify(payload) }, accessToken);
    return {
        id: postId,
        authorId: "",
        authorName: "",
        authorAvatarUrl: null,
        supportRequestId: payload.supportRequestId ?? null,
        supportRequestTitle: null,
        content: payload.content,
        visibility: payload.visibility,
        status: "ACTIVE",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

export async function updatePostComment(
    accessToken: string,
    commentId: string,
    payload: { content: string },
): Promise<PostComment> {
    // [BE PENDING]: return apiData<PostComment>(`/api/v1/comments/${encodeURIComponent(commentId)}`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);
    return {
        id: commentId,
        postId: "",
        authorId: "",
        authorName: "User",
        authorAvatarUrl: null,
        content: payload.content,
        parentCommentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

export async function getMyPosts(
    accessToken: string,
): Promise<PostSummaryResponse[]> {
    return getStoredPosts().filter((p) => p.authorId === "me" || p.authorName === "Bạn");
}
