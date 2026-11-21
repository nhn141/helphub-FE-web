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
// DỮ LIỆU ĐỒNG BỘ: Tin nhắn hội thoại thật, khởi tạo sạch không dùng dữ liệu giả
// ============================================================================

const MOCK_CONVERSATIONS: ConversationSummaryResponse[] = [];
const MOCK_MESSAGES: Record<string, MessageResponse[]> = {};

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
    return MOCK_MESSAGES[conversationId] || [];
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

const MOCK_CHAT_USERS: UserSearchResponse[] = [];

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
