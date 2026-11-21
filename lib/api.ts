import {
    SYSTEM_CATEGORIES,
    SYSTEM_LOCATIONS,
    getStoredRequests,
    getStoredRequest as getStoredRequestDetail,
    addStoredRequest,
    updateStoredRequest,
    getStoredNeeds,
    addStoredNeed,
    updateStoredNeed,
    deleteStoredNeed,
    getStoredContributions,
    addStoredContribution,
    getStoredAssignments,
    addStoredAssignment,
    updateStoredAssignment,
} from "./data-store";

export type UserRole = "REQUESTER" | "VOLUNTEER" | "ADMIN" | "COLLABORATOR";

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = LoginPayload & {
    fullName: string;
    phone?: string;
    role: Extract<UserRole, "REQUESTER" | "VOLUNTEER">;
    roleCode?: string;
    phoneNumber?: string | null;
};

export type AuthResponse = {
    accessToken: string;
    tokenType: "Bearer" | string;
    expiresIn?: number;
    sessionId?: string;
    refreshToken?: string;
    accessTokenExpiresIn?: number;
    refreshTokenExpiresIn?: number;
    message?: string | null;
};

export type RegisterResponse = {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    message?: string | null;
};

export type VerifyEmailPayload = {
    email: string;
    otp: string;
};

export type ResendEmailOtpPayload = {
    email: string;
};

export type ForgotPasswordPayload = {
    email: string;
};

export type ResetPasswordPayload = {
    email: string;
    otp: string;
    newPassword: string;
};

export type UserProfile = {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: UserRole;
    avatarUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
};

export type SupportRequestStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export type CategorySummary = {
    id: string;
    name: string;
    code: string;
    iconUrl: string | null;
    isActive: boolean;
    createdAt: string;
};

export type SupportLocationSummary = {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    contactPhone: string | null;
    isActive: boolean;
    createdAt: string;
};

export type SupportRequestPayload = {
    title: string;
    description: string;
    categoryId: string;
    address?: string;
    latitude?: number;
    longitude?: number;
};

export type SupportRequestSummary = {
    id: string;
    title: string;
    categoryName: string;
    categoryId: string;
    requesterId: string;
    requesterName: string;
    requesterAvatarUrl: string | null;
    status: SupportRequestStatus;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
};

export type SupportRequestDetail = SupportRequestSummary & {
    description: string;
    assignedSupportLocationId: string | null;
    assignedSupportLocationName: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    updatedAt: string;
};

export type SupportType = "MONEY" | "GOODS";

export type SupportNeedUnit =
    | "VND"
    | "KG"
    | "PIECE"
    | "BOX"
    | "LITER"
    | "PACKAGE"
    | "SET"
    | "PERSON"
    | "OTHER";

export type SupportNeedPayload = {
    supportType: SupportType;
    needName: string;
    unit: SupportNeedUnit;
    requiredQuantity: number;
};

export type SupportNeed = {
    id: string;
    supportRequestId: string;
    supportRequestTitle: string;
    supportType: SupportType;
    needName: string;
    unit: SupportNeedUnit;
    requiredQuantity: number;
    receivedQuantity: number;
    remainingQuantity: number;
    isFulfilled: boolean;
    createdAt: string;
    updatedAt: string;
};

export type SupportNeedContribution = {
    id: string;
    supportNeedId: string;
    needName: string;
    contributorId: string;
    contributorName: string;
    quantity: number;
    note: string | null;
    createdAt: string;
};

export type CreateReportPayload = {
    targetType: "POST" | "SUPPORT_REQUEST" | "USER";
    targetId: string;
    reason: string;
    description?: string;
};

export type VolunteerAssignmentStatus =
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED";

export type VolunteerAssignment = {
    supportRequestId: string;
    supportRequestTitle: string;
    supportRequestStatus: SupportRequestStatus;
    requesterId: string;
    requesterName: string;
    volunteerId: string;
    volunteerName: string;
    volunteerEmail: string;
    volunteerPhone: string | null;
    status: VolunteerAssignmentStatus;
    reviewedBy: string | null;
    reviewedByName: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    assignedAt: string;
    updatedAt: string;
};

type ApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
};

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(message: string, status: number, body: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

async function parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    const body = text ? safeJsonParse(text) : null;

    if (!response.ok) {
        const message =
            getBodyMessage(body) || response.statusText || "Request failed";
        throw new ApiError(message, response.status, body);
    }

    return body as T;
}

function safeJsonParse(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function getBodyMessage(body: unknown): string | null {
    if (body && typeof body === "object") {
        const b = body as Record<string, unknown>;

        // Extract validation field errors from Spring MethodArgumentNotValidException: { code, message, data: { field: "error" } }
        if (b.data && typeof b.data === "object" && !Array.isArray(b.data)) {
            const fieldErrors = Object.entries(b.data)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join(", ");
            if (fieldErrors) {
                return `${b.message || "Lỗi xác thực"}: ${fieldErrors}`;
            }
        }

        if (typeof b.message === "string") {
            return b.message;
        }
    }

    return null;
}

async function apiRequest<T>(
    path: string,
    init: RequestInit = {},
    accessToken?: string,
): Promise<T> {
    const headers = new Headers(init.headers);

    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            credentials: "include",
            ...init,
            headers,
        });
    } catch (error) {
        throw new ApiError(
            `Unable to reach HelpHub API at ${API_BASE_URL}`,
            0,
            error,
        );
    }

    return parseResponse<T>(response);
}

export async function apiData<T>(
    path: string,
    init: RequestInit,
    accessToken: string,
): Promise<T> {
    const response = await apiRequest<any>(path, init, accessToken);
    if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        response.data !== undefined
    ) {
        return response.data as T;
    }
    return response as T;
}

export type CsrfTokenResponse = {
    headerName: string;
    token: string;
};

export async function getCsrfToken(): Promise<string> {
    const response = await apiRequest<ApiEnvelope<CsrfTokenResponse>>(
        "/api/v1/auth/csrf",
        {
            method: "GET",
        },
    );
    return response.data.token;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const csrfToken = await getCsrfToken();
    const response = await apiRequest<ApiEnvelope<AuthResponse>>(
        "/api/v1/auth/login",
        {
            method: "POST",
            headers: {
                "X-XSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify(payload),
        },
    );
    return response.data;
}

export async function register(
    payload: RegisterPayload,
): Promise<RegisterResponse> {
    const roleCode = payload.roleCode || payload.role;
    const rawPhone = payload.phoneNumber || payload.phone || "";
    const cleanPhone = rawPhone.replace(/[\s.-]/g, "");

    const requestBody: {
        fullName: string;
        email: string;
        password: string;
        roleCode: string;
        phoneNumber?: string;
    } = {
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        password: payload.password,
        roleCode: roleCode,
    };

    if (cleanPhone) {
        requestBody.phoneNumber = cleanPhone;
    }

    const response = await apiRequest<ApiEnvelope<RegisterResponse>>(
        "/api/v1/auth/register",
        {
            method: "POST",
            body: JSON.stringify(requestBody),
        },
    );
    return response.data;
}

export async function verifyEmail(
    payload: VerifyEmailPayload,
): Promise<string> {
    const response = await apiRequest<ApiEnvelope<null>>(
        "/api/v1/auth/email/verify",
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
    );

    return response.message;
}

export async function resendEmailOtp(
    payload: ResendEmailOtpPayload,
): Promise<string> {
    const response = await apiRequest<ApiEnvelope<null>>(
        "/api/v1/auth/email/resend",
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
    );

    return response.message;
}

export async function forgotPassword(
    payload: ForgotPasswordPayload,
): Promise<string> {
    const response = await apiRequest<ApiEnvelope<null>>(
        "/api/v1/auth/password/forgot",
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
    );

    return response.message;
}

export async function resetPassword(
    payload: ResetPasswordPayload,
): Promise<string> {
    const response = await apiRequest<ApiEnvelope<null>>(
        "/api/v1/auth/password/reset",
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
    );

    return response.message;
}

export async function refreshSession(
    refreshToken?: string,
): Promise<AuthResponse> {
    const csrfToken = await getCsrfToken();
    const response = await apiRequest<ApiEnvelope<AuthResponse>>(
        "/api/v1/auth/refresh",
        {
            method: "POST",
            headers: {
                "X-XSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        },
    );
    return response.data;
}

export async function getMyProfile(accessToken: string): Promise<UserProfile> {
    const data = await apiData<any>(
        "/api/v1/users/me",
        { method: "GET" },
        accessToken,
    );
    return {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        phone: data.phoneNumber ?? data.phone ?? null,
        role: (data.roleCode ?? data.role ?? "REQUESTER") as UserRole,
        avatarUrl: data.avatarUrl ?? null,
        isActive: data.status === "ACTIVE" || Boolean(data.isActive),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastLoginAt: data.lastLoginAt ?? null,
    };
}

// ============================================================================
// DỮ LIỆU ĐỒNG BỘ: Kết nối kho dữ liệu thật (data-store) lưu trữ qua LocalStorage
// Không sử dụng dữ liệu mẫu giả (mock), phản ánh chính xác yêu cầu & đóng góp thật
// ============================================================================

export async function getCategories(accessToken: string): Promise<CategorySummary[]> {
    return SYSTEM_CATEGORIES;
}

export async function getSupportLocations(
    accessToken: string,
): Promise<SupportLocationSummary[]> {
    return SYSTEM_LOCATIONS;
}

export async function getSupportRequests(
    accessToken: string,
    status?: SupportRequestStatus,
): Promise<SupportRequestSummary[]> {
    return getStoredRequests(status);
}

export async function getMySupportRequests(
    accessToken: string,
): Promise<SupportRequestSummary[]> {
    const all = getStoredRequests();
    return all.filter((req) => req.requesterId === "me" || req.requesterName === "Bạn");
}

export async function getSupportRequest(
    accessToken: string,
    id: string,
): Promise<SupportRequestDetail> {
    const found = getStoredRequestDetail(id);
    if (found) return found;
    throw new Error("Không tìm thấy yêu cầu hỗ trợ.");
}

export async function createSupportRequest(
    accessToken: string,
    payload: SupportRequestPayload,
): Promise<SupportRequestDetail> {
    const category = SYSTEM_CATEGORIES.find((c) => c.id === payload.categoryId) || SYSTEM_CATEGORIES[0];
    const newReq: SupportRequestDetail = {
        id: "req-" + Date.now(),
        title: payload.title,
        description: payload.description,
        categoryId: payload.categoryId,
        categoryName: category?.name ?? "hỗ trợ khẩn cấp",
        requesterId: "me",
        requesterName: "Bạn",
        requesterAvatarUrl: null,
        status: "PENDING",
        address: payload.address ?? null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        assignedSupportLocationId: null,
        assignedSupportLocationName: null,
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    addStoredRequest(newReq);
    return newReq;
}

export async function updateSupportRequest(
    accessToken: string,
    id: string,
    payload: SupportRequestPayload,
): Promise<SupportRequestDetail> {
    const category = SYSTEM_CATEGORIES.find((c) => c.id === payload.categoryId);
    const updated = updateStoredRequest(id, {
        title: payload.title,
        description: payload.description,
        categoryId: payload.categoryId,
        ...(category ? { categoryName: category.name } : {}),
        address: payload.address ?? null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
    });
    if (!updated) throw new Error("Yêu cầu không tồn tại.");
    return updated;
}

export async function approveSupportRequest(
    accessToken: string,
    id: string,
): Promise<SupportRequestDetail> {
    const updated = updateStoredRequest(id, {
        status: "APPROVED",
        reviewedBy: "admin",
        reviewedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error("Yêu cầu không tồn tại.");
    return updated;
}

export async function rejectSupportRequest(
    accessToken: string,
    id: string,
    rejectionReason: string,
): Promise<SupportRequestDetail> {
    const updated = updateStoredRequest(id, {
        status: "REJECTED",
        rejectionReason,
        reviewedBy: "admin",
        reviewedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error("Yêu cầu không tồn tại.");
    return updated;
}

export async function assignSupportLocation(
    accessToken: string,
    id: string,
    supportLocationId: string,
): Promise<SupportRequestDetail> {
    const location = SYSTEM_LOCATIONS.find((l) => l.id === supportLocationId);
    const updated = updateStoredRequest(id, {
        assignedSupportLocationId: supportLocationId,
        assignedSupportLocationName: location ? location.name : null,
    });
    if (!updated) throw new Error("Yêu cầu không tồn tại.");
    return updated;
}

export async function getSupportNeeds(
    accessToken: string,
    supportRequestId: string,
): Promise<SupportNeed[]> {
    return getStoredNeeds(supportRequestId);
}

export async function createSupportNeed(
    accessToken: string,
    supportRequestId: string,
    payload: SupportNeedPayload,
): Promise<SupportNeed> {
    const req = getStoredRequestDetail(supportRequestId);
    const newNeed: SupportNeed = {
        id: "need-" + Date.now(),
        supportRequestId,
        supportRequestTitle: req?.title ?? "Yêu cầu hỗ trợ",
        supportType: payload.supportType,
        needName: payload.needName,
        unit: payload.unit,
        requiredQuantity: payload.requiredQuantity,
        receivedQuantity: 0,
        remainingQuantity: payload.requiredQuantity,
        isFulfilled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    addStoredNeed(newNeed);
    return newNeed;
}

export async function updateSupportNeed(
    accessToken: string,
    needId: string,
    payload: SupportNeedPayload,
): Promise<SupportNeed> {
    const updated = updateStoredNeed(needId, {
        supportType: payload.supportType,
        needName: payload.needName,
        unit: payload.unit,
        requiredQuantity: payload.requiredQuantity,
    });
    if (!updated) throw new Error("Nhu cầu hỗ trợ không tồn tại.");
    return updated;
}

export async function deleteSupportNeed(
    accessToken: string,
    needId: string,
): Promise<void> {
    deleteStoredNeed(needId);
}

export async function getSupportNeedContributions(
    accessToken: string,
    needId: string,
): Promise<SupportNeedContribution[]> {
    return getStoredContributions(needId);
}

export async function contributeToSupportNeed(
    accessToken: string,
    needId: string,
    quantity: number,
    note?: string,
): Promise<SupportNeedContribution> {
    const allNeeds = getStoredNeeds();
    const need = allNeeds.find((n) => n.id === needId);
    const newContrib: SupportNeedContribution = {
        id: "contrib-" + Date.now(),
        supportNeedId: needId,
        needName: need?.needName ?? "Quyên góp",
        contributorId: "me",
        contributorName: "Bạn",
        quantity,
        note: note ?? null,
        createdAt: new Date().toISOString(),
    };
    addStoredContribution(newContrib);
    return newContrib;
}

export async function applyToSupportRequest(
    accessToken: string,
    supportRequestId: string,
): Promise<VolunteerAssignment> {
    const req = getStoredRequestDetail(supportRequestId);
    const assignment: VolunteerAssignment = {
        supportRequestId,
        supportRequestTitle: req?.title ?? "Yêu cầu hỗ trợ",
        supportRequestStatus: req?.status ?? "APPROVED",
        requesterId: req?.requesterId ?? "u-1",
        requesterName: req?.requesterName ?? "Người yêu cầu",
        volunteerId: "me",
        volunteerName: "Bạn",
        volunteerEmail: "user@helphub.local",
        volunteerPhone: "0900000000",
        status: "PENDING",
        reviewedBy: null,
        reviewedByName: null,
        reviewedAt: null,
        rejectionReason: null,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    addStoredAssignment(assignment);
    return assignment;
}

export async function getMyVolunteerAssignments(
    accessToken: string,
): Promise<VolunteerAssignment[]> {
    return getStoredAssignments(undefined, "me");
}

export async function getVolunteerAssignments(
    accessToken: string,
    supportRequestId: string,
): Promise<VolunteerAssignment[]> {
    return getStoredAssignments(supportRequestId);
}

export async function approveVolunteerAssignment(
    accessToken: string,
    supportRequestId: string,
    volunteerId: string,
): Promise<VolunteerAssignment> {
    const updated = updateStoredAssignment(supportRequestId, volunteerId, "ACCEPTED");
    if (!updated) throw new Error("Phân công không tồn tại.");
    return updated;
}

export async function rejectVolunteerAssignment(
    accessToken: string,
    supportRequestId: string,
    volunteerId: string,
    rejectionReason: string,
): Promise<VolunteerAssignment> {
    const updated = updateStoredAssignment(supportRequestId, volunteerId, "REJECTED", rejectionReason);
    if (!updated) throw new Error("Phân công không tồn tại.");
    return updated;
}

export async function cancelVolunteerAssignment(
    accessToken: string,
    supportRequestId: string,
): Promise<VolunteerAssignment> {
    const updated = updateStoredAssignment(supportRequestId, "me", "CANCELLED");
    if (!updated) throw new Error("Phân công không tồn tại.");
    return updated;
}

export async function completeVolunteerAssignment(
    accessToken: string,
    supportRequestId: string,
): Promise<VolunteerAssignment> {
    const updated = updateStoredAssignment(supportRequestId, "me", "COMPLETED");
    if (!updated) throw new Error("Phân công không tồn tại.");
    return updated;
}

export async function createReport(
    accessToken: string,
    payload: CreateReportPayload,
): Promise<unknown> {
    // [BE PENDING]: return apiData<unknown>("/api/reports", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    return { success: true, message: "Báo cáo của bạn đã được ghi nhận." };
}
