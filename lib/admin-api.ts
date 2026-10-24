import { apiData } from "./api";
import {
    SupportRequestSummary,
    SupportRequestStatus,
} from "./api";

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

export type UserRole = "REQUESTER" | "VOLUNTEER" | "ADMIN" | "COLLABORATOR";

export interface UserSummary {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    avatarUrl: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface UserDashboardStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    requesters: number;
    volunteers: number;
    collaborators: number;
    admins: number;
}

export interface SupportRequestDashboardStats {
    totalSupportRequests: number;
    pending: number;
    approved: number;
    inProgress: number;
    rejected: number;
    completed: number;
    cancelled: number;
}

export interface CategoryDashboardItem {
    categoryId: string;
    categoryName: string;
    supportRequestCount: number;
}

export interface CategoryDashboardStats {
    totalCategories: number;
    activeCategories: number;
    categories: CategoryDashboardItem[];
}

export interface PostDashboardStats {
    totalPosts: number;
    active: number;
    underReview: number;
    hidden: number;
    removed: number;
}

export interface ReportDashboardStats {
    totalReports: number;
    supportRequestReports: number;
    postReports: number;
    userReports: number;
    pending: number;
    reviewed: number;
    resolved: number;
}

// Category types
export interface Category {
    id: string;
    name: string;
    code: string;
    description: string;
    iconUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SupportLocation {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    contactPhone: string;
    bankName: string | null;
    bankAccountNumber: string | null;
    isActive: boolean;
    createdAt: string;
}

export type ReportTargetType = "SUPPORT_REQUEST" | "POST" | "USER";
export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED";

export interface Report {
    id: string;
    targetId: string;
    targetType: ReportTargetType;
    reason: string;
    description: string | null;
    reporterId: string;
    reporterName: string;
    status: ReportStatus;
    resolutionNote: string | null;
    resolvedById: string | null;
    resolvedByName: string | null;
    createdAt: string;
    resolvedAt: string | null;
}

export type RoleUpgradeRequestStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";

export interface RoleUpgradeRequest {
    id: string;
    userId: string;
    userFullName: string;
    volunteerId: string;
    reason: string;
    supportingDocumentsUrl: string | null;
    status: RoleUpgradeRequestStatus;
    rejectionReason: string | null;
    processedById: string | null;
    processedByName: string | null;
    createdAt: string;
    processedAt: string | null;
}

export interface CommunityFund {
    id: string;
    name: string;
    description: string;
    totalBalance: number;
    isActive: boolean;
    createdAt: string;
}

export interface Donation {
    id: string;
    fundId: string;
    donorName: string;
    amount: number;
    description: string | null;
    donatedAt: string;
}

export interface Expense {
    id: string;
    fundId: string;
    fundName: string;
    supportRequestId: string | null;
    supportRequestTitle: string | null;
    amount: number;
    description: string;
    createdById: string;
    createdByName: string;
    createdAt: string;
}

export async function getAdminDashboardUsers(
    accessToken: string,
): Promise<UserDashboardStats> {
    // [BE PENDING]: return await apiData<UserDashboardStats>("/api/admin/dashboard/users", { method: "GET" }, accessToken);
    return {
        totalUsers: 24,
        activeUsers: 22,
        inactiveUsers: 2,
        requesters: 16,
        volunteers: 6,
        collaborators: 1,
        admins: 1,
    };
}
export async function getAdminDashboardSupportRequests(
    accessToken: string,
): Promise<SupportRequestDashboardStats> {
    // [BE PENDING]: return await apiData<SupportRequestDashboardStats>("/api/admin/dashboard/support-requests", { method: "GET" }, accessToken);
    return {
        totalSupportRequests: 15,
        pending: 3,
        approved: 5,
        inProgress: 4,
        rejected: 1,
        completed: 2,
        cancelled: 0,
    };
}
export async function getAdminDashboardCategories(
    accessToken: string,
): Promise<CategoryDashboardStats> {
    // [BE PENDING]: return await apiData<CategoryDashboardStats>("/api/admin/dashboard/categories", { method: "GET" }, accessToken);
    return {
        totalCategories: 4,
        activeCategories: 4,
        categories: [
            {
                categoryId: "cat-1",
                categoryName: "Cứu trợ khẩn cấp",
                supportRequestCount: 6,
            },
            {
                categoryId: "cat-2",
                categoryName: "Lương thực & Nhu yếu phẩm",
                supportRequestCount: 4,
            },
            {
                categoryId: "cat-3",
                categoryName: "Y tế & Thuốc men",
                supportRequestCount: 3,
            },
            {
                categoryId: "cat-4",
                categoryName: "Giáo dục vùng cao",
                supportRequestCount: 2,
            },
        ],
    };
}
export async function getAdminDashboardPosts(
    accessToken: string,
): Promise<PostDashboardStats> {
    // [BE PENDING]: return await apiData<PostDashboardStats>("/api/admin/dashboard/posts", { method: "GET" }, accessToken);
    return {
        totalPosts: 8,
        active: 7,
        underReview: 1,
        hidden: 0,
        removed: 0,
    };
}
export async function getAdminDashboardReports(
    accessToken: string,
): Promise<ReportDashboardStats> {
    // [BE PENDING]: return await apiData<ReportDashboardStats>("/api/admin/dashboard/reports", { method: "GET" }, accessToken);
    return {
        totalReports: 3,
        supportRequestReports: 1,
        postReports: 1,
        userReports: 1,
        pending: 2,
        reviewed: 1,
        resolved: 0,
    };
}

export async function getUsersList(
    accessToken: string,
    params: {
        keyword?: string;
        role?: UserRole;
        page?: number;
        size?: number;
        sort?: string;
    },
): Promise<PageResponse<UserSummary>> {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.role) query.set("roleCode", params.role);
    if (params.page !== undefined) query.set("page", params.page.toString());
    if (params.size !== undefined) query.set("size", params.size.toString());
    if (params.sort) query.set("sort", params.sort);

    try {
        const res = await apiData<any>(
            `/api/v1/admin/users?${query.toString()}`,
            { method: "GET" },
            accessToken,
        );
        return {
            content: (res.content || []).map((u: any) => ({
                id: u.id,
                fullName: u.fullName,
                email: u.email,
                role: (u.roleCode || u.role) as UserRole,
                avatarUrl: u.avatarUrl ?? null,
                phoneNumber: u.phoneNumber ?? u.phone ?? null,
                isActive: u.status === "ACTIVE" || Boolean(u.isActive),
                createdAt: u.createdAt,
            })),
            totalElements: res.totalElements ?? 0,
            totalPages: res.totalPages ?? 1,
            size: res.size ?? 20,
            number: res.page ?? res.number ?? 0,
            first: (res.page ?? res.number ?? 0) === 0,
            last: (res.page ?? res.number ?? 0) >= (res.totalPages ?? 1) - 1,
            numberOfElements: res.content?.length ?? 0,
            empty: !res.content || res.content.length === 0,
        };
    } catch (err: any) {
        if (err?.status === 404) {
            return {
                content: [],
                totalElements: 0,
                totalPages: 1,
                size: params.size ?? 20,
                number: params.page ?? 0,
                first: true,
                last: true,
                numberOfElements: 0,
                empty: true,
            };
        }
        throw err;
    }
}

export async function getUserDetail(
    accessToken: string,
    userId: string,
): Promise<UserSummary> {
    const u = await apiData<any>(
        `/api/v1/admin/users/${encodeURIComponent(userId)}`,
        { method: "GET" },
        accessToken,
    );
    return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: (u.roleCode || u.role) as UserRole,
        avatarUrl: u.avatarUrl ?? null,
        phoneNumber: u.phoneNumber ?? u.phone ?? null,
        isActive: u.status === "ACTIVE" || Boolean(u.isActive),
        createdAt: u.createdAt,
    };
}

export function patchUserRole(
    accessToken: string,
    userId: string,
    payload: { role: UserRole },
): Promise<void> {
    return apiData<void>(
        `/api/v1/admin/users/${encodeURIComponent(userId)}/role`,
        {
            method: "PATCH",
            body: JSON.stringify({ roleCode: payload.role }),
        },
        accessToken,
    );
}

export function patchUserStatus(
    accessToken: string,
    userId: string,
    payload: { isActive: boolean },
): Promise<void> {
    return apiData<void>(
        `/api/v1/admin/users/${encodeURIComponent(userId)}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status: payload.isActive ? "ACTIVE" : "SUSPENDED",
            }),
        },
        accessToken,
    );
}

// ============================================================================
// MOCK DATA: Dữ liệu mẫu cho các module quản trị chưa có backend microservices
// ============================================================================

const MOCK_ADMIN_SUPPORT_REQUESTS: SupportRequestSummary[] = [
    {
        id: "req-1",
        title: "Cứu trợ lương thực và nước sạch sau bão lũ tại Quảng Bình",
        categoryName: "Cứu trợ khẩn cấp",
        categoryId: "cat-1",
        requesterId: "u-1",
        requesterName: "Nguyễn Văn An",
        requesterAvatarUrl: null,
        status: "APPROVED",
        address: "Xã Tân Hóa, Huyện Minh Hóa, Tỉnh Quảng Bình",
        latitude: 17.76,
        longitude: 105.99,
        createdAt: "2026-10-20T09:00:00Z",
    },
    {
        id: "req-2",
        title: "Hỗ trợ áo ấm và sách vở cho học sinh điểm trường Mèo Vạc",
        categoryName: "Giáo dục vùng cao",
        categoryId: "cat-4",
        requesterId: "u-2",
        requesterName: "Trần Thị Mai",
        requesterAvatarUrl: null,
        status: "IN_PROGRESS",
        address: "Xã Pả Vi, Huyện Mèo Vạc, Tỉnh Hà Giang",
        latitude: 23.16,
        longitude: 105.41,
        createdAt: "2026-10-21T10:30:00Z",
    },
    {
        id: "req-3",
        title: "Thuốc men y tế sơ cấp cứu cho bà con vùng ngập sâu Lệ Thủy",
        categoryName: "Y tế & Thuốc men",
        categoryId: "cat-3",
        requesterId: "u-3",
        requesterName: "Lê Hoàng Long",
        requesterAvatarUrl: null,
        status: "PENDING",
        address: "Huyện Lệ Thủy, Tỉnh Quảng Bình",
        latitude: 17.21,
        longitude: 106.78,
        createdAt: "2026-10-23T14:15:00Z",
    },
    {
        id: "req-4",
        title: "Cung cấp gạo và mì gói hỗ trợ các hộ gia đình neo đơn",
        categoryName: "Lương thực & Nhu yếu phẩm",
        categoryId: "cat-2",
        requesterId: "u-4",
        requesterName: "Phạm Minh Đức",
        requesterAvatarUrl: null,
        status: "COMPLETED",
        address: "Thị xã Ba Đồn, Tỉnh Quảng Bình",
        latitude: 17.75,
        longitude: 106.42,
        createdAt: "2026-10-15T08:00:00Z",
    },
];

const MOCK_ADMIN_CATEGORIES: Category[] = [
    {
        id: "cat-1",
        name: "Cứu trợ khẩn cấp",
        code: "EMERGENCY",
        description: "Hỗ trợ khẩn cấp thiên tai, bão lũ, sạt lở và sự cố bất ngờ",
        iconUrl: null,
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
        updatedAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-2",
        name: "Lương thực & Nhu yếu phẩm",
        code: "FOOD_SUPPLIES",
        description: "Gạo, mì gói, nước sạch, thực phẩm khô và vật dụng thiết yếu",
        iconUrl: null,
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
        updatedAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-3",
        name: "Y tế & Thuốc men",
        code: "MEDICAL",
        description: "Thuốc thiết yếu, vật tư y tế, sơ cứu và chăm sóc sức khỏe",
        iconUrl: null,
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
        updatedAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-4",
        name: "Giáo dục vùng cao",
        code: "EDUCATION",
        description: "Sách vở, áo ấm, học bổng và thiết bị học tập cho học sinh vùng cao",
        iconUrl: null,
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
        updatedAt: "2026-01-10T08:00:00Z",
    },
];

const MOCK_ADMIN_LOCATIONS: SupportLocation[] = [
    {
        id: "loc-1",
        name: "Điểm tiếp nhận Hà Nội - Cầu Giấy",
        description: "Kho tập kết hàng hóa và phân loại nhu yếu phẩm khu vực miền Bắc",
        latitude: 21.0285,
        longitude: 105.8542,
        address: "Số 18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
        contactPhone: "0912345678",
        bankName: "Vietcombank",
        bankAccountNumber: "0011001234567",
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "loc-2",
        name: "Trạm điều phối Miền Trung - Đà Nẵng",
        description: "Trung tâm tiếp nhận và chuyển tiếp hàng cứu hộ vào vùng bão lũ",
        latitude: 16.0544,
        longitude: 108.2022,
        address: "120 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
        contactPhone: "0987654321",
        bankName: "BIDV",
        bankAccountNumber: "12310009876543",
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "loc-3",
        name: "Trung tâm cứu trợ TP. Hồ Chí Minh",
        description: "Điểm quyên góp và tiếp nhận hỗ trợ khu vực phía Nam",
        latitude: 10.7769,
        longitude: 106.7009,
        address: "45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh",
        contactPhone: "0903123456",
        bankName: "Techcombank",
        bankAccountNumber: "19033445566778",
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
];

const MOCK_ADMIN_REPORTS: Report[] = [
    {
        id: "rep-1",
        targetId: "post-1",
        targetType: "POST",
        reason: "Nghi vấn sai lệch địa điểm tiếp nhận",
        description: "Người dùng thắc mắc địa điểm tiếp nhận có thay đổi so với thông báo ban đầu.",
        reporterId: "u-9",
        reporterName: "Ngô Văn Hùng",
        status: "PENDING",
        resolutionNote: null,
        resolvedById: null,
        resolvedByName: null,
        createdAt: "2026-10-23T11:00:00Z",
        resolvedAt: null,
    },
    {
        id: "rep-2",
        targetId: "req-3",
        targetType: "SUPPORT_REQUEST",
        reason: "Yêu cầu cần xác minh khẩn cấp",
        description: "Khu vực huyện Lệ Thủy nước dâng nhanh, cần ưu tiên duyệt sớm hỗ trợ thuốc men.",
        reporterId: "u-10",
        reporterName: "Đỗ Thị Hà",
        status: "REVIEWED",
        resolutionNote: "Đang liên hệ trạm y tế xã xác nhận danh mục thuốc",
        resolvedById: "admin",
        resolvedByName: "HelpHub Admin",
        createdAt: "2026-10-22T08:30:00Z",
        resolvedAt: null,
    },
];

const MOCK_ADMIN_UPGRADES: RoleUpgradeRequest[] = [
    {
        id: "up-1",
        userId: "u-2",
        userFullName: "Trần Thị Mai",
        volunteerId: "vol-2",
        reason: "Đã có 2 năm kinh nghiệm phụ trách các đoàn cứu trợ vùng cao, muốn nâng cấp thành Cộng tác viên (Collaborator) để quản lý điểm tập kết Hà Giang.",
        supportingDocumentsUrl: null,
        status: "PENDING",
        rejectionReason: null,
        processedById: null,
        processedByName: null,
        createdAt: "2026-10-21T14:00:00Z",
        processedAt: null,
    },
];

const MOCK_ADMIN_FUNDS: CommunityFund[] = [
    {
        id: "fund-1",
        name: "Quỹ Cứu Trợ Bão Lũ Miền Trung 2026",
        description: "Quỹ chuyên biệt mua sắm thuyền cứu hộ, áo phao, nước sạch và hỗ trợ sửa chữa nhà tốc mái cho bà con vùng bão lũ.",
        totalBalance: 125000000,
        isActive: true,
        createdAt: "2026-10-01T00:00:00Z",
    },
];

const MOCK_ADMIN_EXPENSES: Expense[] = [
    {
        id: "exp-1",
        fundId: "fund-1",
        fundName: "Quỹ Cứu Trợ Bão Lũ Miền Trung 2026",
        supportRequestId: "req-1",
        supportRequestTitle: "Cứu trợ lương thực Quảng Bình",
        amount: 35000000,
        description: "Mua 100 áo phao cứu sinh đạt chuẩn và 1 tấn gạo chuyển khẩn cấp vào vùng rốn lũ Tân Hóa",
        createdById: "admin",
        createdByName: "HelpHub Admin",
        createdAt: "2026-10-21T10:00:00Z",
    },
    {
        id: "exp-2",
        fundId: "fund-1",
        fundName: "Quỹ Cứu Trợ Bão Lũ Miền Trung 2026",
        supportRequestId: null,
        supportRequestTitle: null,
        amount: 15000000,
        description: "Chi phí thuê 2 chuyến xe tải vận chuyển nhu yếu phẩm Hà Nội - Đà Nẵng",
        createdById: "admin",
        createdByName: "HelpHub Admin",
        createdAt: "2026-10-22T14:00:00Z",
    },
];

export async function getAdminSupportRequests(
    accessToken: string,
    params: {
        status?: SupportRequestStatus;
        categoryId?: string;
        createdFrom?: string;
        createdTo?: string;
    },
): Promise<SupportRequestSummary[]> {
    // [BE PENDING]: return apiData<SupportRequestSummary[]>(`/api/v1/support-requests?${query.toString()}`, { method: "GET" }, accessToken);
    if (!params.status) return MOCK_ADMIN_SUPPORT_REQUESTS;
    return MOCK_ADMIN_SUPPORT_REQUESTS.filter((req) => req.status === params.status);
}

export async function approveSupportRequest(
    accessToken: string,
    requestId: string,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/support-requests/${encodeURIComponent(requestId)}/approve`, { method: "PATCH" }, accessToken);
    const item = MOCK_ADMIN_SUPPORT_REQUESTS.find((r) => r.id === requestId);
    if (item) item.status = "APPROVED";
    return Promise.resolve();
}

export async function rejectSupportRequest(
    accessToken: string,
    requestId: string,
    payload: { rejectionReason: string },
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/support-requests/${encodeURIComponent(requestId)}/reject`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);
    const item = MOCK_ADMIN_SUPPORT_REQUESTS.find((r) => r.id === requestId);
    if (item) item.status = "REJECTED";
    return Promise.resolve();
}

export async function assignSupportLocationToRequest(
    accessToken: string,
    requestId: string,
    payload: { supportLocationId: string },
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/support-requests/${encodeURIComponent(requestId)}/assign-support-location`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);
    return Promise.resolve();
}

export async function getAllReports(accessToken: string): Promise<Report[]> {
    // [BE PENDING]: return apiData<Report[]>("/api/reports", { method: "GET" }, accessToken);
    return MOCK_ADMIN_REPORTS;
}

export async function getPendingReports(accessToken: string): Promise<Report[]> {
    // [BE PENDING]: return apiData<Report[]>("/api/reports/pending", { method: "GET" }, accessToken);
    return MOCK_ADMIN_REPORTS.filter((r) => r.status === "PENDING");
}

export async function getReportDetail(
    accessToken: string,
    reportId: string,
): Promise<Report> {
    // [BE PENDING]: return apiData<Report>(`/api/reports/${encodeURIComponent(reportId)}`, { method: "GET" }, accessToken);
    const found = MOCK_ADMIN_REPORTS.find((r) => r.id === reportId);
    if (found) return found;
    return MOCK_ADMIN_REPORTS[0];
}

export async function reviewReport(
    accessToken: string,
    reportId: string,
    payload: { resolutionNote: string },
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/reports/${encodeURIComponent(reportId)}/review`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);
    const item = MOCK_ADMIN_REPORTS.find((r) => r.id === reportId);
    if (item) {
        item.status = "REVIEWED";
        item.resolutionNote = payload.resolutionNote;
    }
    return Promise.resolve();
}

export async function resolveReport(
    accessToken: string,
    reportId: string,
    payload: { resolutionNote: string; supportRequestRejectionReason?: string },
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/reports/${encodeURIComponent(reportId)}/resolve`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);
    const item = MOCK_ADMIN_REPORTS.find((r) => r.id === reportId);
    if (item) {
        item.status = "RESOLVED";
        item.resolutionNote = payload.resolutionNote;
        item.resolvedAt = new Date().toISOString();
    }
    return Promise.resolve();
}

export async function getAdminCategories(
    accessToken: string,
    activeOnly: boolean = false,
): Promise<Category[]> {
    // [BE PENDING]: return apiData<Category[]>(`/api/v1/categories?activeOnly=${activeOnly}`, { method: "GET" }, accessToken);
    if (activeOnly) return MOCK_ADMIN_CATEGORIES.filter((c) => c.isActive);
    return MOCK_ADMIN_CATEGORIES;
}

export async function createCategory(
    accessToken: string,
    payload: Omit<Category, "id" | "isActive" | "createdAt" | "updatedAt">,
): Promise<Category> {
    // [BE PENDING]: return apiData<Category>("/api/v1/categories", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    const newCat: Category = {
        id: "cat-" + Date.now(),
        name: payload.name,
        code: payload.code,
        description: payload.description,
        iconUrl: payload.iconUrl,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    MOCK_ADMIN_CATEGORIES.push(newCat);
    return newCat;
}

export async function updateCategory(
    accessToken: string,
    categoryId: string,
    payload: Omit<Category, "id" | "isActive" | "createdAt" | "updatedAt">,
): Promise<Category> {
    // [BE PENDING]: return apiData<Category>(`/api/v1/categories/${encodeURIComponent(categoryId)}`, { method: "PUT", body: JSON.stringify(payload) }, accessToken);
    const cat = MOCK_ADMIN_CATEGORIES.find((c) => c.id === categoryId);
    if (cat) {
        cat.name = payload.name;
        cat.code = payload.code;
        cat.description = payload.description;
        cat.updatedAt = new Date().toISOString();
        return cat;
    }
    throw new Error("Category not found");
}

export async function patchCategoryStatus(
    accessToken: string,
    categoryId: string,
    payload: { isActive: boolean },
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/categories/${encodeURIComponent(categoryId)}/status`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);
    const cat = MOCK_ADMIN_CATEGORIES.find((c) => c.id === categoryId);
    if (cat) cat.isActive = payload.isActive;
    return Promise.resolve();
}

export async function getAdminSupportLocations(
    accessToken: string,
    activeOnly: boolean = false,
): Promise<SupportLocation[]> {
    // [BE PENDING]: return apiData<SupportLocation[]>(`/api/v1/support-locations?activeOnly=${activeOnly}`, { method: "GET" }, accessToken);
    if (activeOnly) return MOCK_ADMIN_LOCATIONS.filter((l) => l.isActive);
    return MOCK_ADMIN_LOCATIONS;
}

export async function createSupportLocation(
    accessToken: string,
    payload: Omit<SupportLocation, "id" | "isActive" | "createdAt">,
): Promise<SupportLocation> {
    // [BE PENDING]: return apiData<SupportLocation>("/api/v1/support-locations", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    const newLoc: SupportLocation = {
        id: "loc-" + Date.now(),
        name: payload.name,
        description: payload.description,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        contactPhone: payload.contactPhone,
        bankName: payload.bankName,
        bankAccountNumber: payload.bankAccountNumber,
        isActive: true,
        createdAt: new Date().toISOString(),
    };
    MOCK_ADMIN_LOCATIONS.push(newLoc);
    return newLoc;
}

export async function updateSupportLocation(
    accessToken: string,
    locationId: string,
    payload: Omit<SupportLocation, "id" | "isActive" | "createdAt">,
): Promise<SupportLocation> {
    // [BE PENDING]: return apiData<SupportLocation>(`/api/v1/support-locations/${encodeURIComponent(locationId)}`, { method: "PUT", body: JSON.stringify(payload) }, accessToken);
    const loc = MOCK_ADMIN_LOCATIONS.find((l) => l.id === locationId);
    if (loc) {
        Object.assign(loc, payload);
        return loc;
    }
    throw new Error("Location not found");
}

export async function patchSupportLocationStatus(
    accessToken: string,
    locationId: string,
    payload: { isActive: boolean },
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/support-locations/${encodeURIComponent(locationId)}/status`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);
    const loc = MOCK_ADMIN_LOCATIONS.find((l) => l.id === locationId);
    if (loc) loc.isActive = payload.isActive;
    return Promise.resolve();
}

export async function getRoleUpgradeRequestsList(
    accessToken: string,
    params: { status?: RoleUpgradeRequestStatus; page?: number; size?: number },
): Promise<PageResponse<RoleUpgradeRequest>> {
    // [BE PENDING]: return apiData<PageResponse<RoleUpgradeRequest>>(`/api/v1/role-upgrade-requests?${query.toString()}`, { method: "GET" }, accessToken);
    const content = params.status
        ? MOCK_ADMIN_UPGRADES.filter((u) => u.status === params.status)
        : MOCK_ADMIN_UPGRADES;
    return {
        content,
        totalElements: content.length,
        totalPages: 1,
        size: params.size ?? 10,
        number: params.page ?? 0,
        first: true,
        last: true,
        numberOfElements: content.length,
        empty: content.length === 0,
    };
}

export async function approveRoleUpgradeRequest(
    accessToken: string,
    requestId: string,
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/role-upgrade-requests/${encodeURIComponent(requestId)}/approve`, { method: "PATCH" }, accessToken);
    const item = MOCK_ADMIN_UPGRADES.find((u) => u.id === requestId);
    if (item) item.status = "APPROVED";
    return Promise.resolve();
}

export async function rejectRoleUpgradeRequest(
    accessToken: string,
    requestId: string,
    payload: { rejectionReason: string },
): Promise<void> {
    // [BE PENDING]: return apiData<void>(`/api/v1/role-upgrade-requests/${encodeURIComponent(requestId)}/reject`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);
    const item = MOCK_ADMIN_UPGRADES.find((u) => u.id === requestId);
    if (item) {
        item.status = "REJECTED";
        item.rejectionReason = payload.rejectionReason;
    }
    return Promise.resolve();
}

export async function getCommunityFunds(
    accessToken: string,
    activeOnly: boolean = false,
): Promise<CommunityFund[]> {
    // [BE PENDING]: return apiData<CommunityFund[]>(`/api/v1/community-funds?activeOnly=${activeOnly}`, { method: "GET" }, accessToken);
    if (activeOnly) return MOCK_ADMIN_FUNDS.filter((f) => f.isActive);
    return MOCK_ADMIN_FUNDS;
}

export async function createCommunityFund(
    accessToken: string,
    payload: Omit<
        CommunityFund,
        "id" | "isActive" | "createdAt" | "totalBalance"
    >,
): Promise<CommunityFund> {
    // [BE PENDING]: return apiData<CommunityFund>("/api/v1/community-funds", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    const newFund: CommunityFund = {
        id: "fund-" + Date.now(),
        name: payload.name,
        description: payload.description,
        totalBalance: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
    };
    MOCK_ADMIN_FUNDS.push(newFund);
    return newFund;
}

export async function updateCommunityFund(
    accessToken: string,
    fundId: string,
    payload: Omit<CommunityFund, "id" | "createdAt" | "totalBalance">,
): Promise<CommunityFund> {
    // [BE PENDING]: return apiData<CommunityFund>(`/api/v1/community-funds/${encodeURIComponent(fundId)}`, { method: "PUT", body: JSON.stringify(payload) }, accessToken);
    const fund = MOCK_ADMIN_FUNDS.find((f) => f.id === fundId);
    if (fund) {
        fund.name = payload.name;
        fund.description = payload.description;
        return fund;
    }
    throw new Error("Fund not found");
}

export async function getFundExpenses(
    accessToken: string,
    fundId: string,
): Promise<Expense[]> {
    // [BE PENDING]: return apiData<Expense[]>(`/api/v1/community-funds/${encodeURIComponent(fundId)}/expenses`, { method: "GET" }, accessToken);
    return MOCK_ADMIN_EXPENSES.filter((e) => e.fundId === fundId);
}

export async function createExpense(
    accessToken: string,
    payload: {
        fundId: string;
        supportRequestId: string | null;
        amount: number;
        description: string;
    },
): Promise<Expense> {
    // [BE PENDING]: return apiData<Expense>("/api/v1/expenses", { method: "POST", body: JSON.stringify(payload) }, accessToken);
    const fund = MOCK_ADMIN_FUNDS.find((f) => f.id === payload.fundId);
    const newExp: Expense = {
        id: "exp-" + Date.now(),
        fundId: payload.fundId,
        fundName: fund ? fund.name : "Quỹ",
        supportRequestId: payload.supportRequestId,
        supportRequestTitle: payload.supportRequestId ? "Yêu cầu cứu trợ" : null,
        amount: payload.amount,
        description: payload.description,
        createdById: "admin",
        createdByName: "HelpHub Admin",
        createdAt: new Date().toISOString(),
    };
    MOCK_ADMIN_EXPENSES.unshift(newExp);
    return newExp;
}
