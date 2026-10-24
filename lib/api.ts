export type UserRole = "REQUESTER" | "VOLUNTEER" | "ADMIN" | "COLLABORATOR";

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = LoginPayload & {
    fullName: string;
    phone?: string;
    role: Extract<UserRole, "REQUESTER" | "VOLUNTEER">;
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

export type RegisterResponse = Omit<
    AuthResponse,
    "accessToken" | "refreshToken" | "tokenType"
> & {
    accessToken: string | null;
    refreshToken: string | null;
    tokenType: "Bearer" | null;
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
    if (body && typeof body === "object" && "message" in body) {
        const message = (body as { message?: unknown }).message;
        return typeof message === "string" ? message : null;
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
    const response = await apiRequest<ApiEnvelope<T>>(path, init, accessToken);
    return response.data;
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
    const response = await apiRequest<ApiEnvelope<RegisterResponse>>(
        "/api/v1/auth/register",
        {
            method: "POST",
            body: JSON.stringify(payload),
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
// MOCK DATA: Dữ liệu mẫu hiển thị cho các tab chưa có API trên backend microservices
// ============================================================================

const MOCK_CATEGORIES: CategorySummary[] = [
    {
        id: "cat-1",
        name: "Cứu trợ khẩn cấp",
        code: "EMERGENCY",
        iconUrl: null,
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-2",
        name: "Lương thực & Nhu yếu phẩm",
        code: "FOOD_SUPPLIES",
        iconUrl: null,
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-3",
        name: "Y tế & Thuốc men",
        code: "MEDICAL",
        iconUrl: null,
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-4",
        name: "Giáo dục vùng cao",
        code: "EDUCATION",
        iconUrl: null,
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
];

const MOCK_LOCATIONS: SupportLocationSummary[] = [
    {
        id: "loc-1",
        name: "Điểm tiếp nhận Hà Nội - Cầu Giấy",
        latitude: 21.0285,
        longitude: 105.8542,
        address: "Số 18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
        contactPhone: "0912345678",
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "loc-2",
        name: "Trạm điều phối Miền Trung - Đà Nẵng",
        latitude: 16.0544,
        longitude: 108.2022,
        address: "120 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
        contactPhone: "0987654321",
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "loc-3",
        name: "Trung tâm cứu trợ TP. Hồ Chí Minh",
        latitude: 10.7769,
        longitude: 106.7009,
        address: "45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh",
        contactPhone: "0903123456",
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
];

const MOCK_SUPPORT_REQUESTS: SupportRequestDetail[] = [
    {
        id: "req-1",
        title: "Cứu trợ lương thực và nước sạch sau bão lũ tại Quảng Bình",
        description:
            "Do ảnh hưởng của đợt bão lũ vừa qua, hơn 200 hộ dân tại xã Tân Hóa bị cô lập hoàn toàn. Nguồn nước sinh hoạt bị nhiễm bẩn, lương thực dự trữ cạn kiệt. Rất mong nhận được sự hỗ trợ khẩn cấp về gạo, nước uống đóng chai và thuốc men.",
        categoryName: "Cứu trợ khẩn cấp",
        categoryId: "cat-1",
        requesterId: "u-1",
        requesterName: "Nguyễn Văn An",
        requesterAvatarUrl: null,
        status: "APPROVED",
        address: "Xã Tân Hóa, Huyện Minh Hóa, Tỉnh Quảng Bình",
        latitude: 17.76,
        longitude: 105.99,
        assignedSupportLocationId: "loc-2",
        assignedSupportLocationName: "Trạm điều phối Miền Trung - Đà Nẵng",
        reviewedBy: "admin-1",
        reviewedAt: "2026-10-21T08:30:00Z",
        rejectionReason: null,
        createdAt: "2026-10-20T09:00:00Z",
        updatedAt: "2026-10-21T08:30:00Z",
    },
    {
        id: "req-2",
        title: "Hỗ trợ áo ấm và sách vở cho học sinh điểm trường Mèo Vạc",
        description:
            "Mùa đông vùng cao đang đến gần, điểm trường tiểu học Mèo Vạc có 120 em học sinh thiếu áo ấm và đồ dùng học tập. Kêu gọi các tấm lòng hảo tâm quyên góp áo ấm mùa đông, chăn bông và sách vở tiểu học.",
        categoryName: "Giáo dục vùng cao",
        categoryId: "cat-4",
        requesterId: "u-2",
        requesterName: "Trần Thị Mai",
        requesterAvatarUrl: null,
        status: "IN_PROGRESS",
        address: "Xã Pả Vi, Huyện Mèo Vạc, Tỉnh Hà Giang",
        latitude: 23.16,
        longitude: 105.41,
        assignedSupportLocationId: "loc-1",
        assignedSupportLocationName: "Điểm tiếp nhận Hà Nội - Cầu Giấy",
        reviewedBy: "admin-1",
        reviewedAt: "2026-10-22T10:00:00Z",
        rejectionReason: null,
        createdAt: "2026-10-21T10:30:00Z",
        updatedAt: "2026-10-22T10:00:00Z",
    },
    {
        id: "req-3",
        title: "Thuốc men y tế sơ cấp cứu cho bà con vùng ngập sâu Lệ Thủy",
        description:
            "Khu vực huyện Lệ Thủy đang ngập sâu, nhiều người già và trẻ em bị mắc các bệnh da liễu, cảm cúm và tiêu hóa do tiếp xúc nguồn nước bẩn. Cần gấp túi sơ cứu gia đình và thuốc men cơ bản.",
        categoryName: "Y tế & Thuốc men",
        categoryId: "cat-3",
        requesterId: "u-3",
        requesterName: "Lê Hoàng Long",
        requesterAvatarUrl: null,
        status: "PENDING",
        address: "Huyện Lệ Thủy, Tỉnh Quảng Bình",
        latitude: 17.21,
        longitude: 106.78,
        assignedSupportLocationId: null,
        assignedSupportLocationName: null,
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        createdAt: "2026-10-23T14:15:00Z",
        updatedAt: "2026-10-23T14:15:00Z",
    },
    {
        id: "req-4",
        title: "Cung cấp gạo và mì gói hỗ trợ các hộ gia đình neo đơn",
        description:
            "Chương trình cung cấp 500 suất quà nhu yếu phẩm thiết yếu cho các cụ già neo đơn và gia đình có hoàn cảnh đặc biệt khó khăn tại vùng bão lũ.",
        categoryName: "Lương thực & Nhu yếu phẩm",
        categoryId: "cat-2",
        requesterId: "u-4",
        requesterName: "Phạm Minh Đức",
        requesterAvatarUrl: null,
        status: "COMPLETED",
        address: "Thị xã Ba Đồn, Tỉnh Quảng Bình",
        latitude: 17.75,
        longitude: 106.42,
        assignedSupportLocationId: "loc-2",
        assignedSupportLocationName: "Trạm điều phối Miền Trung - Đà Nẵng",
        reviewedBy: "admin-1",
        reviewedAt: "2026-10-16T08:00:00Z",
        rejectionReason: null,
        createdAt: "2026-10-15T08:00:00Z",
        updatedAt: "2026-10-19T17:00:00Z",
    },
];

const MOCK_SUPPORT_NEEDS: SupportNeed[] = [
    {
        id: "need-1",
        supportRequestId: "req-1",
        supportRequestTitle: "Cứu trợ lương thực và nước sạch sau bão lũ tại Quảng Bình",
        supportType: "GOODS",
        needName: "Gạo tẻ (bao 25kg)",
        unit: "PACKAGE",
        requiredQuantity: 100,
        receivedQuantity: 65,
        remainingQuantity: 35,
        isFulfilled: false,
        createdAt: "2026-10-20T09:00:00Z",
        updatedAt: "2026-10-21T11:00:00Z",
    },
    {
        id: "need-2",
        supportRequestId: "req-1",
        supportRequestTitle: "Cứu trợ lương thực và nước sạch sau bão lũ tại Quảng Bình",
        supportType: "GOODS",
        needName: "Nước khoáng sạch (thùng 24 chai)",
        unit: "BOX",
        requiredQuantity: 200,
        receivedQuantity: 200,
        remainingQuantity: 0,
        isFulfilled: true,
        createdAt: "2026-10-20T09:00:00Z",
        updatedAt: "2026-10-22T16:00:00Z",
    },
    {
        id: "need-3",
        supportRequestId: "req-1",
        supportRequestTitle: "Cứu trợ lương thực và nước sạch sau bão lũ tại Quảng Bình",
        supportType: "MONEY",
        needName: "Kinh phí sửa chữa mái nhà bị tốc mái",
        unit: "VND",
        requiredQuantity: 50000000,
        receivedQuantity: 32000000,
        remainingQuantity: 18000000,
        isFulfilled: false,
        createdAt: "2026-10-20T09:00:00Z",
        updatedAt: "2026-10-22T18:00:00Z",
    },
];

const MOCK_VOLUNTEER_ASSIGNMENTS: VolunteerAssignment[] = [
    {
        supportRequestId: "req-1",
        supportRequestTitle: "Cứu trợ lương thực và nước sạch sau bão lũ tại Quảng Bình",
        supportRequestStatus: "APPROVED",
        requesterId: "u-1",
        requesterName: "Nguyễn Văn An",
        volunteerId: "vol-demo",
        volunteerName: "Tình nguyện viên HelpHub",
        volunteerEmail: "volunteer@helphub.local",
        volunteerPhone: "0988776655",
        status: "ACCEPTED",
        reviewedBy: "admin-1",
        reviewedByName: "HelpHub Admin",
        reviewedAt: "2026-10-21T09:00:00Z",
        rejectionReason: null,
        assignedAt: "2026-10-21T09:00:00Z",
        updatedAt: "2026-10-21T09:00:00Z",
    },
    {
        supportRequestId: "req-2",
        supportRequestTitle: "Hỗ trợ áo ấm và sách vở cho học sinh điểm trường Mèo Vạc",
        supportRequestStatus: "IN_PROGRESS",
        requesterId: "u-2",
        requesterName: "Trần Thị Mai",
        volunteerId: "vol-demo",
        volunteerName: "Tình nguyện viên HelpHub",
        volunteerEmail: "volunteer@helphub.local",
        volunteerPhone: "0988776655",
        status: "ACCEPTED",
        reviewedBy: "admin-1",
        reviewedByName: "HelpHub Admin",
        reviewedAt: "2026-10-22T11:00:00Z",
        rejectionReason: null,
        assignedAt: "2026-10-22T11:00:00Z",
        updatedAt: "2026-10-22T11:00:00Z",
    },
];

export async function getCategories(accessToken: string): Promise<CategorySummary[]> {
    // [BE PENDING]: return apiData<CategorySummary[]>("/api/v1/categories?activeOnly=true", { method: "GET" }, accessToken);
    return MOCK_CATEGORIES;
}

export async function getSupportLocations(
    accessToken: string,
): Promise<SupportLocationSummary[]> {
    // [BE PENDING]: return apiData<SupportLocationSummary[]>("/api/v1/support-locations?activeOnly=true", { method: "GET" }, accessToken);
    return MOCK_LOCATIONS;
}

export async function getSupportRequests(
    accessToken: string,
    status?: SupportRequestStatus,
): Promise<SupportRequestSummary[]> {
    // [BE PENDING]: const query = status ? `?status=${encodeURIComponent(status)}` : "";
    // [BE PENDING]: return apiData<SupportRequestSummary[]>(`/api/v1/support-requests${query}`, { method: "GET" }, accessToken);
    if (!status) return MOCK_SUPPORT_REQUESTS;
    return MOCK_SUPPORT_REQUESTS.filter((req) => req.status === status);
}

export async function getMySupportRequests(
    accessToken: string,
): Promise<SupportRequestSummary[]> {
    // [BE PENDING]: return apiData<SupportRequestSummary[]>("/api/v1/support-requests/my-requests", { method: "GET" }, accessToken);
    return MOCK_SUPPORT_REQUESTS.slice(0, 2);
}

export async function getSupportRequest(
    accessToken: string,
    id: string,
): Promise<SupportRequestDetail> {
    // [BE PENDING]: return apiData<SupportRequestDetail>(`/api/v1/support-requests/${encodeURIComponent(id)}`, { method: "GET" }, accessToken);
    const found = MOCK_SUPPORT_REQUESTS.find((req) => req.id === id);
    if (found) return found;
    return {
        ...MOCK_SUPPORT_REQUESTS[0],
        id,
    };
}

export async function createSupportRequest(
    accessToken: string,
    payload: SupportRequestPayload,
): Promise<SupportRequestDetail> {
    // [BE PENDING]: return apiData<SupportRequestDetail>("/api/v1/support-requests", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    const category = MOCK_CATEGORIES.find((c) => c.id === payload.categoryId) || MOCK_CATEGORIES[0];
    const newReq: SupportRequestDetail = {
        id: "req-" + Date.now(),
        title: payload.title,
        description: payload.description,
        categoryId: payload.categoryId,
        categoryName: category.name,
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
    MOCK_SUPPORT_REQUESTS.unshift(newReq);
    return newReq;
}

export async function updateSupportRequest(
    accessToken: string,
    id: string,
    payload: SupportRequestPayload,
): Promise<SupportRequestDetail> {
    // [BE PENDING]: return apiData<SupportRequestDetail>(`/api/v1/support-requests/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) }, accessToken);
    const existing = await getSupportRequest(accessToken, id);
    return {
        ...existing,
        title: payload.title,
        description: payload.description,
        address: payload.address ?? existing.address,
        updatedAt: new Date().toISOString(),
    };
}

export async function approveSupportRequest(
    accessToken: string,
    id: string,
): Promise<SupportRequestDetail> {
    // [BE PENDING]: return apiData<SupportRequestDetail>(`/api/v1/support-requests/${encodeURIComponent(id)}/approve`, { method: "PATCH" }, accessToken);
    const existing = await getSupportRequest(accessToken, id);
    existing.status = "APPROVED";
    return existing;
}

export async function rejectSupportRequest(
    accessToken: string,
    id: string,
    rejectionReason: string,
): Promise<SupportRequestDetail> {
    // [BE PENDING]: return apiData<SupportRequestDetail>(`/api/v1/support-requests/${encodeURIComponent(id)}/reject`, { method: "PATCH", body: JSON.stringify({ rejectionReason }) }, accessToken);
    const existing = await getSupportRequest(accessToken, id);
    existing.status = "REJECTED";
    existing.rejectionReason = rejectionReason;
    return existing;
}

export async function assignSupportLocation(
    accessToken: string,
    id: string,
    supportLocationId: string,
): Promise<SupportRequestDetail> {
    // [BE PENDING]: return apiData<SupportRequestDetail>(`/api/v1/support-requests/${encodeURIComponent(id)}/assign-support-location`, { method: "PATCH", body: JSON.stringify({ supportLocationId }) }, accessToken);
    const existing = await getSupportRequest(accessToken, id);
    const location = MOCK_LOCATIONS.find((l) => l.id === supportLocationId);
    existing.assignedSupportLocationId = supportLocationId;
    existing.assignedSupportLocationName = location ? location.name : null;
    return existing;
}

export async function getSupportNeeds(
    accessToken: string,
    supportRequestId: string,
): Promise<SupportNeed[]> {
    // [BE PENDING]: return apiData<SupportNeed[]>(`/api/v1/support-requests/${encodeURIComponent(supportRequestId)}/needs`, { method: "GET" }, accessToken);
    return MOCK_SUPPORT_NEEDS.map((n) => ({ ...n, supportRequestId }));
}

export async function createSupportNeed(
    accessToken: string,
    supportRequestId: string,
    payload: SupportNeedPayload,
): Promise<SupportNeed> {
    // [BE PENDING]: return apiData<SupportNeed>(`/api/v1/support-requests/${encodeURIComponent(supportRequestId)}/needs`, { method: "POST", body: JSON.stringify(payload) }, accessToken);
    const newNeed: SupportNeed = {
        id: "need-" + Date.now(),
        supportRequestId,
        supportRequestTitle: "Yêu cầu cứu trợ",
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
    MOCK_SUPPORT_NEEDS.push(newNeed);
    return newNeed;
}

export async function updateSupportNeed(
    accessToken: string,
    needId: string,
    payload: SupportNeedPayload,
): Promise<SupportNeed> {
    // [BE PENDING]: return apiData<SupportNeed>(`/api/v1/support-needs/${encodeURIComponent(needId)}`, { method: "PUT", body: JSON.stringify(payload) }, accessToken);
    return {
        id: needId,
        supportRequestId: "req-1",
        supportRequestTitle: "Yêu cầu cứu trợ",
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
}

export async function deleteSupportNeed(
    accessToken: string,
    needId: string,
): Promise<void> {
    // [BE PENDING]: await apiData<null>(`/api/v1/support-needs/${encodeURIComponent(needId)}`, { method: "DELETE" }, accessToken);
    return Promise.resolve();
}

export async function getSupportNeedContributions(
    accessToken: string,
    needId: string,
): Promise<SupportNeedContribution[]> {
    // [BE PENDING]: return apiData<SupportNeedContribution[]>(`/api/v1/support-needs/${encodeURIComponent(needId)}/contributions`, { method: "GET" }, accessToken);
    return [
        {
            id: "contrib-1",
            supportNeedId: needId,
            needName: "Gạo tẻ",
            contributorId: "u-contributor",
            contributorName: "Đoàn thiện nguyện Hà Nội",
            quantity: 50,
            note: "Ủng hộ đồng bào bão lũ",
            createdAt: "2026-10-22T10:00:00Z",
        },
    ];
}

export async function contributeToSupportNeed(
    accessToken: string,
    needId: string,
    quantity: number,
    note?: string,
): Promise<SupportNeedContribution> {
    // [BE PENDING]: return apiData<SupportNeedContribution>(`/api/v1/support-needs/${encodeURIComponent(needId)}/contributions`, { method: "POST", body: JSON.stringify({ quantity, note: note || undefined }) }, accessToken);
    return {
        id: "contrib-" + Date.now(),
        supportNeedId: needId,
        needName: "Quyên góp",
        contributorId: "me",
        contributorName: "Bạn",
        quantity,
        note: note ?? null,
        createdAt: new Date().toISOString(),
    };
}

export async function applyToSupportRequest(
    accessToken: string,
    supportRequestId: string,
): Promise<VolunteerAssignment> {
    // [BE PENDING]: return apiData<VolunteerAssignment>(`/api/v1/volunteer-assignments/support-requests/${encodeURIComponent(supportRequestId)}/apply`, { method: "POST" }, accessToken);
    return {
        supportRequestId,
        supportRequestTitle: "Yêu cầu cứu trợ",
        supportRequestStatus: "APPROVED",
        requesterId: "u-1",
        requesterName: "Nguyễn Văn An",
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
}

export async function getMyVolunteerAssignments(
    accessToken: string,
): Promise<VolunteerAssignment[]> {
    // [BE PENDING]: return apiData<VolunteerAssignment[]>("/api/v1/volunteer-assignments/my-assignments", { method: "GET" }, accessToken);
    return MOCK_VOLUNTEER_ASSIGNMENTS;
}

export async function getVolunteerAssignments(
    accessToken: string,
    supportRequestId: string,
): Promise<VolunteerAssignment[]> {
    // [BE PENDING]: return apiData<VolunteerAssignment[]>(`/api/v1/volunteer-assignments/support-requests/${encodeURIComponent(supportRequestId)}`, { method: "GET" }, accessToken);
    return MOCK_VOLUNTEER_ASSIGNMENTS.filter((v) => v.supportRequestId === supportRequestId);
}

export async function approveVolunteerAssignment(
    accessToken: string,
    supportRequestId: string,
    volunteerId: string,
): Promise<VolunteerAssignment> {
    // [BE PENDING]: return apiData<VolunteerAssignment>(`/api/v1/volunteer-assignments/support-requests/${encodeURIComponent(supportRequestId)}/volunteers/${encodeURIComponent(volunteerId)}/approve`, { method: "PATCH" }, accessToken);
    return {
        ...MOCK_VOLUNTEER_ASSIGNMENTS[0],
        status: "ACCEPTED",
    };
}

export async function rejectVolunteerAssignment(
    accessToken: string,
    supportRequestId: string,
    volunteerId: string,
    rejectionReason: string,
): Promise<VolunteerAssignment> {
    // [BE PENDING]: return apiData<VolunteerAssignment>(`/api/v1/volunteer-assignments/support-requests/${encodeURIComponent(supportRequestId)}/volunteers/${encodeURIComponent(volunteerId)}/reject`, { method: "PATCH", body: JSON.stringify({ rejectionReason }) }, accessToken);
    return {
        ...MOCK_VOLUNTEER_ASSIGNMENTS[0],
        status: "REJECTED",
        rejectionReason,
    };
}

export async function cancelVolunteerAssignment(
    accessToken: string,
    supportRequestId: string,
): Promise<VolunteerAssignment> {
    // [BE PENDING]: return apiData<VolunteerAssignment>(`/api/v1/volunteer-assignments/support-requests/${encodeURIComponent(supportRequestId)}/cancel`, { method: "PATCH" }, accessToken);
    return {
        ...MOCK_VOLUNTEER_ASSIGNMENTS[0],
        status: "CANCELLED",
    };
}

export async function completeVolunteerAssignment(
    accessToken: string,
    supportRequestId: string,
): Promise<VolunteerAssignment> {
    // [BE PENDING]: return apiData<VolunteerAssignment>(`/api/v1/volunteer-assignments/support-requests/${encodeURIComponent(supportRequestId)}/complete`, { method: "PATCH" }, accessToken);
    return {
        ...MOCK_VOLUNTEER_ASSIGNMENTS[0],
        status: "COMPLETED",
    };
}

export async function createReport(
    accessToken: string,
    payload: CreateReportPayload,
): Promise<unknown> {
    // [BE PENDING]: return apiData<unknown>("/api/reports", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    return { success: true, message: "Báo cáo của bạn đã được ghi nhận." };
}
