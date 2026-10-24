import { apiData } from "./api";

export type NotificationResponse = {
    id: string;
    content: string;
    referenceType: string;
    referenceId: string;
    actionUrl: string | null;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
};

export type UnreadNotificationCountResponse = {
    unreadCount: number;
};

export type RealtimeNotificationPayload = {
    eventType: string;
    notification: NotificationResponse;
    unreadCount: number;
};

// ============================================================================
// MOCK DATA: Dữ liệu thông báo mẫu
// ============================================================================

const MOCK_NOTIFICATIONS: NotificationResponse[] = [
    {
        id: "notif-1",
        content: "Yêu cầu cứu trợ #REQ-1 (Quảng Bình) đã được Quản trị viên phê duyệt.",
        referenceType: "SUPPORT_REQUEST",
        referenceId: "req-1",
        actionUrl: "/support-requests/req-1",
        isRead: false,
        readAt: null,
        createdAt: "2026-10-24T08:30:00Z",
    },
    {
        id: "notif-2",
        content: "Bạn đã được phân công tham gia hỗ trợ điểm trường Mèo Vạc (Hà Giang).",
        referenceType: "VOLUNTEER_ASSIGNMENT",
        referenceId: "req-2",
        actionUrl: "/support-requests/req-2",
        isRead: false,
        readAt: null,
        createdAt: "2026-10-23T14:15:00Z",
    },
    {
        id: "notif-3",
        content: "Chào mừng bạn gia nhập mạng lưới hỗ trợ cộng đồng HelpHub!",
        referenceType: "SYSTEM",
        referenceId: "sys-1",
        actionUrl: "/dashboard",
        isRead: true,
        readAt: "2026-10-22T09:00:00Z",
        createdAt: "2026-10-22T08:00:00Z",
    },
];

export async function getMyNotifications(
    accessToken: string,
): Promise<NotificationResponse[]> {
    // [BE PENDING]: return apiData<NotificationResponse[]>("/api/v1/notifications", { method: "GET" }, accessToken);
    return MOCK_NOTIFICATIONS;
}

export async function getUnreadNotificationCount(
    accessToken: string,
): Promise<UnreadNotificationCountResponse> {
    // [BE PENDING]: return apiData<UnreadNotificationCountResponse>("/api/v1/notifications/unread-count", { method: "GET" }, accessToken);
    return { unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length };
}

export async function markNotificationAsRead(
    accessToken: string,
    notificationId: string,
): Promise<NotificationResponse> {
    // [BE PENDING]: return apiData<NotificationResponse>(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" }, accessToken);
    const item = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
    if (item) {
        item.isRead = true;
        item.readAt = new Date().toISOString();
        return item;
    }
    return {
        id: notificationId,
        content: "",
        referenceType: "",
        referenceId: "",
        actionUrl: null,
        isRead: true,
        readAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };
}

export async function markAllNotificationsAsRead(
    accessToken: string,
): Promise<void> {
    // [BE PENDING]: return apiData<void>("/api/v1/notifications/read-all", { method: "PATCH" }, accessToken);
    MOCK_NOTIFICATIONS.forEach((n) => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
    });
    return Promise.resolve();
}
