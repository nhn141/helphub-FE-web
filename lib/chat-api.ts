import { PageResponse } from "./admin-api";
import { apiData } from "./api";

export type MessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
export type ConversationType = "PRIVATE" | "GROUP" | "COMMUNITY";
export interface MessageMediaResponse {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
    altText: string | null;
}
export interface MessageResponse {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatarUrl: string | null;
    content: string;
    media: MessageMediaResponse[];
    createdAt: string;
    updatedAt: string;
    editedAt: string | null;
}

export interface ConversationMemberResponse {
    userId: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    joinedAt: string;
}

export interface ConversationSummaryResponse {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    type: ConversationType;
    members: ConversationMemberResponse[];
    lastMessage?: MessageResponse | null;
    unreadCount: number;
    updatedAt: string;
}
export interface CreateMediaPayload {
    fileName: string;
    fileUrl: string;
    fileType: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
    mimeType: string;
    fileSize: number;
    altText: string | null;
    isPublic: boolean;
}

export interface SendMessageRequest {
    content: string;
    mediaIds?: string[];
}

export interface CreateGroupConversationRequest {
    name: string;
    memberIds: string[];
}

export interface UserSearchResponse {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
}

// ============================================================================
// MOCK DATA: Dữ liệu mẫu tin nhắn & hội thoại (Chat)
// ============================================================================

const MOCK_CONVERSATIONS: ConversationSummaryResponse[] = [
    {
        id: "conv-1",
        name: "Nhóm cứu trợ bão lũ Quảng Bình",
        avatarUrl: null,
        type: "GROUP",
        members: [
            {
                userId: "u-1",
                fullName: "Nguyễn Văn An",
                email: "an@helphub.local",
                avatarUrl: null,
                joinedAt: "2026-10-20T00:00:00Z",
            },
            {
                userId: "u-admin",
                fullName: "HelpHub Admin",
                email: "admin@helphub.local",
                avatarUrl: null,
                joinedAt: "2026-10-20T00:00:00Z",
            },
        ],
        lastMessage: {
            id: "msg-1",
            conversationId: "conv-1",
            senderId: "u-1",
            senderName: "Nguyễn Văn An",
            senderAvatarUrl: null,
            content: "Xe chở 500 thùng nước sạch đã tới trụ sở xã Tân Hóa an toàn rồi nhé cả nhóm!",
            media: [],
            createdAt: "2026-10-24T10:15:00Z",
            updatedAt: "2026-10-24T10:15:00Z",
            editedAt: null,
        },
        unreadCount: 1,
        updatedAt: "2026-10-24T10:15:00Z",
    },
    {
        id: "conv-2",
        name: "Trần Thị Mai (Tình nguyện viên)",
        avatarUrl: null,
        type: "PRIVATE",
        members: [
            {
                userId: "u-2",
                fullName: "Trần Thị Mai",
                email: "mai@helphub.local",
                avatarUrl: null,
                joinedAt: "2026-10-21T00:00:00Z",
            },
        ],
        lastMessage: {
            id: "msg-2",
            conversationId: "conv-2",
            senderId: "u-2",
            senderName: "Trần Thị Mai",
            senderAvatarUrl: null,
            content: "Chào bạn, mình đã tổng hợp xong danh sách các em học sinh nhận áo ấm tại Mèo Vạc rồi nhé.",
            media: [],
            createdAt: "2026-10-23T15:30:00Z",
            updatedAt: "2026-10-23T15:30:00Z",
            editedAt: null,
        },
        unreadCount: 0,
        updatedAt: "2026-10-23T15:30:00Z",
    },
];

const MOCK_MESSAGES: Record<string, MessageResponse[]> = {
    "conv-1": [
        {
            id: "m-1",
            conversationId: "conv-1",
            senderId: "u-admin",
            senderName: "HelpHub Admin",
            senderAvatarUrl: null,
            content: "Chào cả nhóm, tình hình vận chuyển hàng vào Tân Hóa hôm nay thế nào rồi An ơi?",
            media: [],
            createdAt: "2026-10-24T09:30:00Z",
            updatedAt: "2026-10-24T09:30:00Z",
            editedAt: null,
        },
        {
            id: "m-2",
            conversationId: "conv-1",
            senderId: "u-1",
            senderName: "Nguyễn Văn An",
            senderAvatarUrl: null,
            content: "Dạ đường vào thôn 3 đã bớt ngập, cano cứu hộ đang tiếp tục trung chuyển hàng vào các hộ dân bị cô lập ạ.",
            media: [],
            createdAt: "2026-10-24T09:45:00Z",
            updatedAt: "2026-10-24T09:45:00Z",
            editedAt: null,
        },
        {
            id: "msg-1",
            conversationId: "conv-1",
            senderId: "u-1",
            senderName: "Nguyễn Văn An",
            senderAvatarUrl: null,
            content: "Xe chở 500 thùng nước sạch đã tới trụ sở xã Tân Hóa an toàn rồi nhé cả nhóm!",
            media: [],
            createdAt: "2026-10-24T10:15:00Z",
            updatedAt: "2026-10-24T10:15:00Z",
            editedAt: null,
        },
    ],
    "conv-2": [
        {
            id: "msg-2",
            conversationId: "conv-2",
            senderId: "u-2",
            senderName: "Trần Thị Mai",
            senderAvatarUrl: null,
            content: "Chào bạn, mình đã tổng hợp xong danh sách các em học sinh nhận áo ấm tại Mèo Vạc rồi nhé.",
            media: [],
            createdAt: "2026-10-23T15:30:00Z",
            updatedAt: "2026-10-23T15:30:00Z",
            editedAt: null,
        },
    ],
};

export async function getMyConversations(
    accessToken: string,
): Promise<ConversationSummaryResponse[]> {
    // [BE PENDING]: return apiData<ConversationSummaryResponse[]>("/api/v1/conversations/me", { method: "GET" }, accessToken);
    return MOCK_CONVERSATIONS;
}

export async function getOrCreatePrivateConversation(
    accessToken: string,
    userId: string,
): Promise<ConversationSummaryResponse> {
    // [BE PENDING]: return apiData<ConversationSummaryResponse>("/api/v1/conversations/private", { method: "POST", body: JSON.stringify({ receiverId: userId }) }, accessToken);
    const found = MOCK_CONVERSATIONS.find((c) => c.id === "conv-" + userId);
    if (found) return found;
    return {
        id: "conv-" + userId,
        name: "Người dùng HelpHub",
        avatarUrl: null,
        type: "PRIVATE",
        members: [],
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
    };
}

export async function markConversationAsRead(
    accessToken: string,
    conversationId: string,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/read`, { method: "PATCH" }, accessToken);
    const conv = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
    if (conv) conv.unreadCount = 0;
    return Promise.resolve();
}

export async function getConversationMessages(
    accessToken: string,
    conversationId: string,
): Promise<MessageResponse[]> {
    // [BE PENDING]: return apiData<MessageResponse[]>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`, { method: "GET" }, accessToken);
    return MOCK_MESSAGES[conversationId] || [
        {
            id: "demo-m",
            conversationId,
            senderId: "other",
            senderName: "Tình nguyện viên",
            senderAvatarUrl: null,
            content: "Xin chào! Bạn cần hỗ trợ thêm thông tin gì về đợt cứu trợ này không ạ?",
            media: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            editedAt: null,
        },
    ];
}

export async function sendMessage(
    accessToken: string,
    conversationId: string,
    payload: SendMessageRequest,
): Promise<MessageResponse> {
    // [BE PENDING]: return apiData<MessageResponse>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`, { method: "POST", body: JSON.stringify(payload) }, accessToken);
    const newMsg: MessageResponse = {
        id: "msg-" + Date.now(),
        conversationId,
        senderId: "me",
        senderName: "Bạn",
        senderAvatarUrl: null,
        content: payload.content,
        media: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedAt: null,
    };
    if (!MOCK_MESSAGES[conversationId]) {
        MOCK_MESSAGES[conversationId] = [];
    }
    MOCK_MESSAGES[conversationId].push(newMsg);
    return newMsg;
}

export async function createPrivateConversationByEmail(
    accessToken: string,
    email: string,
): Promise<ConversationSummaryResponse> {
    // [BE PENDING]: return apiData<ConversationSummaryResponse>("/api/v1/conversations/private/by-email", { method: "POST", body: JSON.stringify({ receiverEmail: email.trim() }) }, accessToken);
    return {
        id: "mock-conv-email-" + Date.now(),
        name: email,
        avatarUrl: null,
        type: "PRIVATE",
        members: [],
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
    };
}

export async function markMessageAsRead(
    accessToken: string,
    conversationId: string,
    messageId: string,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/read`, { method: "PATCH" }, accessToken);
    return Promise.resolve();
}

export async function createMediaRecord(
    accessToken: string,
    payload: CreateMediaPayload,
): Promise<{ id: string }> {
    // [BE PENDING]: return apiData<{ id: string }>("/api/v1/media", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    return { id: "mock-media-" + Date.now() };
}

const MOCK_CHAT_USERS: UserSearchResponse[] = [
    {
        id: "u-1",
        fullName: "Nguyễn Văn An",
        email: "nguyenvanan@gmail.com",
        avatarUrl: null,
    },
    {
        id: "u-2",
        fullName: "CLB Áo Ấm Vùng Cao",
        email: "aoamvungcao@helphub.org",
        avatarUrl: null,
    },
    {
        id: "u-3",
        fullName: "Trần Thị Mai",
        email: "maitran@gmail.com",
        avatarUrl: null,
    },
];

export async function searchUsers(
    accessToken: string,
    keyword: string,
): Promise<UserSearchResponse[]> {
    // [BE PENDING]: return apiData<UserSearchResponse[]>(`/api/v1/users/search?keyword=${encodeURIComponent(keyword)}`, { method: "GET" }, accessToken);
    if (!keyword.trim()) return MOCK_CHAT_USERS;
    const lower = keyword.toLowerCase();
    return MOCK_CHAT_USERS.filter(
        (u) =>
            u.fullName.toLowerCase().includes(lower) ||
            u.email.toLowerCase().includes(lower),
    );
}

export async function createGroupConversation(
    accessToken: string,
    payload: CreateGroupConversationRequest,
): Promise<ConversationSummaryResponse> {
    // [BE PENDING]: return apiData<ConversationSummaryResponse>("/api/v1/conversations/group", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    return {
        id: "mock-group-" + Date.now(),
        name: payload.name,
        avatarUrl: null,
        type: "GROUP",
        members: [],
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
    };
}

export async function leaveConversation(
    accessToken: string,
    conversationId: string,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/members/me`, { method: "DELETE" }, accessToken);
    return Promise.resolve();
}

export async function getConversationById(
    accessToken: string,
    conversationId: string,
): Promise<ConversationSummaryResponse> {
    // [BE PENDING]: return apiData<ConversationSummaryResponse>(`/api/v1/conversations/${encodeURIComponent(conversationId)}`, { method: "GET" }, accessToken);
    return {
        id: conversationId,
        name: null,
        avatarUrl: null,
        type: "PRIVATE",
        members: [],
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
    };
}

export async function addMemberToConversation(
    accessToken: string,
    conversationId: string,
    userId: string,
): Promise<ConversationSummaryResponse> {
    // [BE PENDING]: return apiData<ConversationSummaryResponse>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/members`, { method: "POST", body: JSON.stringify({ userId }) }, accessToken);
    return {
        id: conversationId,
        name: null,
        avatarUrl: null,
        type: "GROUP",
        members: [],
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
    };
}
