import { apiData } from "./api";

export type NotificationResponse = {
    id: string;
    title?: string;
    body?: string;
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

type BackendNotificationItem = {
    id: string;
    type?: string;
    title?: string;
    body?: string;
    read?: boolean;
    createdAt?: string;
};

type BackendNotificationPageResponse = {
    content?: BackendNotificationItem[];
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
};

function mapBackendNotification(item: BackendNotificationItem): NotificationResponse {
    const title = item.title?.trim() || "";
    const body = item.body?.trim() || "";
    const content = title && body ? `${title}: ${body}` : (title || body || "Thông báo hệ thống");

    return {
        id: item.id,
        title,
        body,
        content,
        referenceType: item.type || "SYSTEM",
        referenceId: item.id,
        actionUrl: item.type === "SUPPORT_REQUEST" ? `/support-requests/${item.id}` : "/dashboard",
        isRead: Boolean(item.read),
        readAt: item.read ? (item.createdAt || new Date().toISOString()) : null,
        createdAt: item.createdAt || new Date().toISOString(),
    };
}

// ============================================================================
// Real API: Kết nối trực tiếp tới notification-service (Gateway /api/v1/notifications)
// ============================================================================

export async function getMyNotifications(
    accessToken: string,
    page: number = 0,
    size: number = 20,
): Promise<NotificationResponse[]> {
    try {
        const response = await apiData<BackendNotificationPageResponse | BackendNotificationItem[]>(
            `/api/v1/notifications?page=${page}&size=${size}`,
            { method: "GET" },
            accessToken,
        );

        if (response && "content" in response && Array.isArray(response.content)) {
            return response.content.map(mapBackendNotification);
        }

        if (Array.isArray(response)) {
            return response.map(mapBackendNotification);
        }

        return [];
    } catch (error) {
        console.error("Failed to fetch notifications from backend:", error);
        return [];
    }
}

export async function getUnreadNotificationCount(
    accessToken: string,
): Promise<UnreadNotificationCountResponse> {
    try {
        const response = await apiData<{ unreadCount: number }>(
            "/api/v1/notifications/unread-count",
            { method: "GET" },
            accessToken,
        );

        return {
            unreadCount: Number(response?.unreadCount ?? 0),
        };
    } catch (error) {
        console.error("Failed to fetch unread count from backend:", error);
        return { unreadCount: 0 };
    }
}

export async function markNotificationAsRead(
    accessToken: string,
    notificationId: string,
): Promise<NotificationResponse> {
    try {
        const response = await apiData<BackendNotificationItem>(
            `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
            { method: "PATCH" },
            accessToken,
        );

        return mapBackendNotification(response);
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
        return {
            id: notificationId,
            content: "",
            referenceType: "SYSTEM",
            referenceId: notificationId,
            actionUrl: null,
            isRead: true,
            readAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };
    }
}

export async function markAllNotificationsAsRead(
    accessToken: string,
): Promise<void> {
    try {
        await apiData<any>(
            "/api/v1/notifications/read-all",
            { method: "PATCH" },
            accessToken,
        );
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
    }
}
