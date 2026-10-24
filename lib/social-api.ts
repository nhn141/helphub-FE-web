import { apiData } from "./api";

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
// MOCK DATA: Dữ liệu mẫu bảng tin cộng đồng (Community Feed)
// ============================================================================

const MOCK_POSTS: PostSummaryResponse[] = [
    {
        id: "post-1",
        authorId: "u-1",
        authorName: "Đội Cứu Trợ Tình Nguyện Miền Trung",
        authorAvatarUrl: null,
        supportRequestId: "req-1",
        supportRequestTitle: "Cứu trợ lương thực Quảng Bình",
        content:
            "Hôm nay đội chúng mình đã trao tận tay 150 phần quà nhu yếu phẩm (gạo, mì, nước sạch, áo phao) đến bà con vùng ngập sâu xã Tân Hóa. Cảm ơn sự đồng lòng của tất cả các mạnh thường quân và các bạn tình nguyện viên đã không quản ngại mưa bão!",
        visibility: "PUBLIC",
        status: "ACTIVE",
        isActive: true,
        createdAt: "2026-10-23T16:00:00Z",
        updatedAt: "2026-10-23T16:00:00Z",
    },
    {
        id: "post-2",
        authorId: "u-2",
        authorName: "CLB Áo Ấm Vùng Cao",
        authorAvatarUrl: null,
        supportRequestId: "req-2",
        supportRequestTitle: "Áo ấm cho học sinh Mèo Vạc",
        content:
            "Chúng mình đã tập kết được 200 chiếc áo ấm và 500 quyển vở mới cho các em học sinh tiểu học Hà Giang. Sáng thứ 7 này đội cần thêm 3 bạn tình nguyện viên hỗ trợ đóng gói tại điểm tiếp nhận Hà Nội. Ai tham gia được nhắn tin cho chúng mình nhé!",
        visibility: "PUBLIC",
        status: "ACTIVE",
        isActive: true,
        createdAt: "2026-10-24T09:15:00Z",
        updatedAt: "2026-10-24T09:15:00Z",
    },
];

export async function getPosts(accessToken: string): Promise<PostSummaryResponse[]> {
    // [BE PENDING]: return apiData<PostSummaryResponse[]>("/api/posts", { method: "GET" }, accessToken);
    return MOCK_POSTS;
}

export async function createPost(
    accessToken: string,
    payload: PostPayload,
): Promise<PostSummaryResponse> {
    // [BE PENDING]: return apiData<PostSummaryResponse>("/api/posts", { method: "POST", body: JSON.stringify(payload) }, accessToken);
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
    MOCK_POSTS.unshift(newPost);
    return newPost;
}

export async function deletePost(
    accessToken: string,
    postId: string,
): Promise<void> {
    // [BE PENDING]: await apiData<null>(`/api/posts/${encodeURIComponent(postId)}`, { method: "DELETE" }, accessToken);
    return Promise.resolve();
}

export async function getPostMedia(
    accessToken: string,
    postId: string,
): Promise<PostMedia[]> {
    // [BE PENDING]: return apiData<PostMedia[]>(`/api/v1/posts/${encodeURIComponent(postId)}/media`, { method: "GET" }, accessToken);
    return [];
}

export async function createMediaRecord(
    accessToken: string,
    payload: CreateMediaPayload,
): Promise<{ id: string }> {
    // [BE PENDING]: return apiData<{ id: string }>("/api/v1/media", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    return { id: "mock-media-" + Date.now() };
}

export async function attachMediaToPost(
    accessToken: string,
    postId: string,
    payload: AttachMediaPayload,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/posts/${encodeURIComponent(postId)}/media`, { method: "POST", body: JSON.stringify(payload) }, accessToken);
    return Promise.resolve();
}

export async function getReactionCount(
    accessToken: string,
    postId: string,
): Promise<ReactionCount> {
    // [BE PENDING]: return apiData<ReactionCount>(`/api/v1/posts/${encodeURIComponent(postId)}/reactions/count`, { method: "GET" }, accessToken);
    if (postId === "post-1") {
        return {
            postId,
            totalCount: 32,
            countByType: { LIKE: 20, LOVE: 10, CARE: 2, SAD: 0, WOW: 0 },
        };
    }
    return {
        postId,
        totalCount: 16,
        countByType: { LIKE: 11, LOVE: 5, CARE: 0, SAD: 0, WOW: 0 },
    };
}

export async function getMyReaction(
    accessToken: string,
    postId: string,
): Promise<{ type: PostReactionType } | null> {
    // [BE PENDING]: return await apiData<{ type: PostReactionType }>(`/api/v1/posts/${encodeURIComponent(postId)}/reactions/me`, { method: "GET" }, accessToken);
    return null;
}

export async function reactToPost(
    accessToken: string,
    postId: string,
    type: PostReactionType,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/posts/${encodeURIComponent(postId)}/reactions`, { method: "POST", body: JSON.stringify({ type }) }, accessToken);
    return Promise.resolve();
}

export async function removeReaction(
    accessToken: string,
    postId: string,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/posts/${encodeURIComponent(postId)}/reactions`, { method: "DELETE" }, accessToken);
    return Promise.resolve();
}

export async function updateReaction(
    accessToken: string,
    postId: string,
    type: PostReactionType,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/posts/${encodeURIComponent(postId)}/reactions`, { method: "PATCH", body: JSON.stringify({ type }) }, accessToken);
    return Promise.resolve();
}

const MOCK_COMMENTS: Record<string, PostComment[]> = {
    "post-1": [
        {
            id: "comment-1",
            postId: "post-1",
            authorId: "u-3",
            authorName: "Trần Thị Mai",
            authorAvatarUrl: null,
            content:
                "Đoàn tình nguyện bên mình sáng mai xuất phát từ Hà Nội lên Yên Bái, có thể nhận thêm 2 tấn gạo gửi kèm nhé!",
            parentCommentId: null,
            createdAt: "2026-10-23T15:00:00Z",
            updatedAt: "2026-10-23T15:00:00Z",
        },
        {
            id: "comment-2",
            postId: "post-1",
            authorId: "u-1",
            authorName: "Nguyễn Văn An",
            authorAvatarUrl: null,
            content:
                "Cảm ơn chị Mai nhiều ạ! Em đã gửi số điện thoại liên hệ qua tin nhắn để tiện bốc xếp.",
            parentCommentId: null,
            createdAt: "2026-10-23T15:30:00Z",
            updatedAt: "2026-10-23T15:30:00Z",
        },
    ],
};

export async function getPostComments(
    accessToken: string,
    postId: string,
): Promise<PostComment[]> {
    // [BE PENDING]: return apiData<PostComment[]>(`/api/v1/posts/${encodeURIComponent(postId)}/comments`, { method: "GET" }, accessToken);
    return MOCK_COMMENTS[postId] ?? [];
}

export async function createPostComment(
    accessToken: string,
    postId: string,
    payload: { content: string; parentCommentId: string | null },
): Promise<PostComment> {
    // [BE PENDING]: return apiData<PostComment>(`/api/v1/posts/${encodeURIComponent(postId)}/comments`, { method: "POST", body: JSON.stringify(payload) }, accessToken);
    const newComment: PostComment = {
        id: "mock-comment-" + Date.now(),
        postId,
        authorId: "me",
        authorName: "Bạn",
        authorAvatarUrl: null,
        content: payload.content,
        parentCommentId: payload.parentCommentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    if (!MOCK_COMMENTS[postId]) {
        MOCK_COMMENTS[postId] = [];
    }
    MOCK_COMMENTS[postId].push(newComment);
    return newComment;
}

export async function deletePostComment(
    accessToken: string,
    commentId: string,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" }, accessToken);
    return Promise.resolve();
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
    // [BE PENDING]: return apiData<PostSummaryResponse[]>("/api/posts/my-posts", { method: "GET" }, accessToken);
    return [
        {
            id: "post-my-1",
            authorId: "me",
            authorName: "Bạn (Người dùng)",
            authorAvatarUrl: null,
            supportRequestId: "req-1",
            supportRequestTitle: "Cứu trợ khẩn cấp lũ lụt xã Tân Lập",
            content:
                "Đã cập nhật tình hình bà con tại thôn 2, nước đang rút dần. Đội cứu hộ đang cần thêm thuốc men và nước sạch tiêu độc khử trùng.",
            visibility: "PUBLIC",
            status: "ACTIVE",
            isActive: true,
            createdAt: "2026-10-24T08:00:00Z",
            updatedAt: "2026-10-24T08:00:00Z",
        },
    ];
}
