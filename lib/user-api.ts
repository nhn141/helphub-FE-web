import { apiData } from "./api";

export interface UserProfileResponse {
    id: string;
    fullName: string;
    email: string;
    role: "REQUESTER" | "VOLUNTEER" | "ADMIN" | "COLLABORATOR";
    avatarUrl: string | null;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
}

export interface UpdateProfileRequest {
    fullName: string;
    phone?: string | null;
    avatarUrl?: string | null;
}

export type RoleUpgradeRequestStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";

export interface RoleUpgradeRequestResponse {
    id: string;
    userId: string;
    reason: string;
    supportingDocumentsUrl: string | null;
    status: RoleUpgradeRequestStatus;
    rejectionReason: string | null;
    createdAt: string;
}

export interface CreateRoleUpgradePayload {
    reason: string;
    supportingDocumentsUrl?: string | null;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
}

// ============================================================================
// [BE SUPPORTED]: Các API profile cá nhân trên identity-service
// ============================================================================

export async function getMyProfile(
    accessToken: string,
): Promise<UserProfileResponse> {
    const data = await apiData<any>(
        "/api/v1/users/me",
        { method: "GET" },
        accessToken,
    );
    return {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: (data.roleCode ?? data.role ?? "REQUESTER") as any,
        avatarUrl: data.avatarUrl ?? null,
        phone: data.phoneNumber ?? data.phone ?? null,
        isActive: data.status === "ACTIVE" || Boolean(data.isActive),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastLoginAt: data.lastLoginAt ?? "",
    };
}

export async function updateMyProfile(
    accessToken: string,
    payload: UpdateProfileRequest,
): Promise<UserProfileResponse> {
    const body: Record<string, any> = {
        fullName: payload.fullName,
    };
    if (payload.phone !== undefined) {
        body.phoneNumber = payload.phone;
    }
    const data = await apiData<any>(
        "/api/v1/users/me",
        {
            method: "PATCH",
            body: JSON.stringify(body),
        },
        accessToken,
    );
    return {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: (data.roleCode ?? data.role ?? "REQUESTER") as any,
        avatarUrl: data.avatarUrl ?? null,
        phone: data.phoneNumber ?? data.phone ?? null,
        isActive: data.status === "ACTIVE" || Boolean(data.isActive),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastLoginAt: data.lastLoginAt ?? "",
    };
}

// ============================================================================
// [BE PENDING] role-upgrade-service chưa có trong helphub-microservices.
// Tạm thời comment API thực tế và trả về fallback rỗng.
// ============================================================================

export async function getMyRoleUpgradeRequests(
    accessToken: string,
    page: number = 0,
    size: number = 10,
): Promise<PageResponse<RoleUpgradeRequestResponse>> {
    // [BE PENDING]: return apiData<PageResponse<RoleUpgradeRequestResponse>>(`/api/v1/role-upgrade-requests/me?page=${page}&size=${size}`, { method: "GET" }, accessToken);
    return {
        content: [
            {
                id: "upg-1",
                userId: "me",
                reason: "Xin nâng cấp tài khoản lên Tình nguyện viên để tham gia cứu trợ trực tiếp tại các điểm ngập lũ.",
                supportingDocumentsUrl: null,
                status: "PENDING",
                rejectionReason: null,
                createdAt: "2026-10-23T10:00:00Z",
            },
        ],
        totalElements: 1,
        totalPages: 1,
    };
}

export async function createRoleUpgradeRequest(
    accessToken: string,
    payload: CreateRoleUpgradePayload,
): Promise<RoleUpgradeRequestResponse> {
    // [BE PENDING]: return apiData<RoleUpgradeRequestResponse>("/api/v1/role-upgrade-requests/me", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    return {
        id: "mock-" + Date.now(),
        userId: "",
        reason: payload.reason,
        supportingDocumentsUrl: payload.supportingDocumentsUrl ?? null,
        status: "PENDING",
        rejectionReason: null,
        createdAt: new Date().toISOString(),
    };
}
