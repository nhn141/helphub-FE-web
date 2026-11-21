import type {
    SupportRequestDetail,
    SupportRequestStatus,
    SupportNeed,
    SupportNeedContribution,
    VolunteerAssignment,
    CategorySummary,
    SupportLocationSummary,
} from "./api";
import type { PostSummaryResponse, PostComment, PostReactionType } from "./social-api";

// System reference lookups (danh mục & điểm tiếp nhận hệ thống chuẩn)
export interface SystemCategory extends CategorySummary {
    description?: string;
    displayOrder?: number;
    updatedAt?: string;
}

export interface SystemLocation extends SupportLocationSummary {
    description?: string;
    bankName?: string | null;
    bankAccountNumber?: string | null;
}

export const SYSTEM_CATEGORIES: SystemCategory[] = [
    {
        id: "cat-1",
        name: "hỗ trợ khẩn cấp",
        code: "EMERGENCY",
        description: "Hỗ trợ khẩn cấp người dân trong thiên tai, lũ lụt, sự cố.",
        iconUrl: null,
        isActive: true,
        displayOrder: 1,
        createdAt: "2026-01-10T08:00:00Z",
        updatedAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-2",
        name: "Lương thực & Nhu yếu phẩm",
        code: "FOOD",
        description: "Cung cấp gạo, mì gói, nước sạch và các nhu yếu phẩm cơ bản.",
        iconUrl: null,
        isActive: true,
        displayOrder: 2,
        createdAt: "2026-01-10T08:00:00Z",
        updatedAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-3",
        name: "Y tế & Thuốc men",
        code: "MEDICAL",
        description: "Hỗ trợ thuốc men, sơ cấp cứu và chi phí khám chữa bệnh.",
        iconUrl: null,
        isActive: true,
        displayOrder: 3,
        createdAt: "2026-01-10T08:00:00Z",
        updatedAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "cat-4",
        name: "Giáo dục vùng cao",
        code: "EDUCATION",
        description: "Ủng hộ sách vở, đồ dùng học tập và áo ấm cho học sinh vùng sâu.",
        iconUrl: null,
        isActive: true,
        displayOrder: 4,
        createdAt: "2026-01-10T08:00:00Z",
        updatedAt: "2026-01-10T08:00:00Z",
    },
];

export const SYSTEM_LOCATIONS: SystemLocation[] = [
    {
        id: "loc-1",
        name: "Điểm tiếp nhận Hà Nội - Cầu Giấy",
        description: "Kho tập kết hàng hóa và phân loại nhu yếu phẩm khu vực miền Bắc",
        latitude: 21.0333,
        longitude: 105.7833,
        address: "Số 1 Phạm Văn Đồng, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
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
        latitude: 16.0678,
        longitude: 108.2208,
        address: "120 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
        contactPhone: "0987654321",
        bankName: "BIDV",
        bankAccountNumber: "12310009876543",
        isActive: true,
        createdAt: "2026-01-10T08:00:00Z",
    },
    {
        id: "loc-3",
        name: "Trung tâm hỗ trợ TP. Hồ Chí Minh",
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

// In-memory fallback caches (khi chạy SSR hoặc private mode)
let memoryRequests: SupportRequestDetail[] = [];
let memoryNeeds: SupportNeed[] = [];
let memoryContributions: SupportNeedContribution[] = [];
let memoryAssignments: VolunteerAssignment[] = [];
let memoryPosts: PostSummaryResponse[] = [];
let memoryComments: Record<string, PostComment[]> = {};
export type StoredReactionData = {
    postId: string;
    totalCount: number;
    countByType: Record<PostReactionType, number>;
    myReaction?: PostReactionType;
};
let memoryReactions: Record<string, StoredReactionData> = {};

function getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
        const item = window.localStorage.getItem(key);
        if (!item) return defaultValue;
        return JSON.parse(item) as T;
    } catch {
        return defaultValue;
    }
}

function setStorageItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore
    }
}

const KEYS = {
    REQUESTS: "helphub_real_requests",
    NEEDS: "helphub_real_needs",
    CONTRIBUTIONS: "helphub_real_contributions",
    ASSIGNMENTS: "helphub_real_assignments",
    POSTS: "helphub_real_posts",
    COMMENTS: "helphub_real_comments",
    REACTIONS: "helphub_real_reactions",
};

// ── Support Requests Store (Chỉ lưu và trả về request thật do người dùng tạo) ──
export function getStoredRequests(status?: SupportRequestStatus, categoryId?: string): SupportRequestDetail[] {
    const list = getStorageItem<SupportRequestDetail[]>(KEYS.REQUESTS, memoryRequests);
    memoryRequests = list;
    return list.filter((r) => {
        if (status && r.status !== status) return false;
        if (categoryId && r.categoryId !== categoryId) return false;
        return true;
    });
}

export function getStoredRequest(id: string): SupportRequestDetail | null {
    const list = getStorageItem<SupportRequestDetail[]>(KEYS.REQUESTS, memoryRequests);
    memoryRequests = list;
    return list.find((r) => r.id === id) || null;
}

export function saveStoredRequests(requests: SupportRequestDetail[]): void {
    memoryRequests = requests;
    setStorageItem(KEYS.REQUESTS, requests);
}

export function addStoredRequest(request: SupportRequestDetail): void {
    const current = getStorageItem<SupportRequestDetail[]>(KEYS.REQUESTS, memoryRequests);
    const updated = [request, ...current.filter((r) => r.id !== request.id)];
    saveStoredRequests(updated);
}

export function updateStoredRequest(id: string, updates: Partial<SupportRequestDetail>): SupportRequestDetail | null {
    const current = getStorageItem<SupportRequestDetail[]>(KEYS.REQUESTS, memoryRequests);
    const index = current.findIndex((r) => r.id === id);
    if (index === -1) return null;
    const updatedItem = { ...current[index], ...updates, updatedAt: new Date().toISOString() };
    current[index] = updatedItem;
    saveStoredRequests([...current]);
    return updatedItem;
}

// ── Support Needs Store (Chỉ lưu và trả về nhu cầu thật tương ứng với supportRequestId) ──
export function getStoredNeeds(supportRequestId?: string): SupportNeed[] {
    const all = getStorageItem<SupportNeed[]>(KEYS.NEEDS, memoryNeeds);
    memoryNeeds = all;
    if (!supportRequestId) return all;
    return all.filter((n) => n.supportRequestId === supportRequestId);
}

export function saveStoredNeeds(needs: SupportNeed[]): void {
    memoryNeeds = needs;
    setStorageItem(KEYS.NEEDS, needs);
}

export function addStoredNeed(need: SupportNeed): void {
    const current = getStorageItem<SupportNeed[]>(KEYS.NEEDS, memoryNeeds);
    const updated = [...current, need];
    saveStoredNeeds(updated);
}

export function updateStoredNeed(id: string, updates: Partial<SupportNeed>): SupportNeed | null {
    const current = getStorageItem<SupportNeed[]>(KEYS.NEEDS, memoryNeeds);
    const index = current.findIndex((n) => n.id === id);
    if (index === -1) return null;
    const updatedItem = { ...current[index], ...updates, updatedAt: new Date().toISOString() };
    current[index] = updatedItem;
    saveStoredNeeds([...current]);
    return updatedItem;
}

export function deleteStoredNeed(id: string): void {
    const current = getStorageItem<SupportNeed[]>(KEYS.NEEDS, memoryNeeds);
    saveStoredNeeds(current.filter((n) => n.id !== id));
}

// ── Contributions Store (Chỉ lưu đóng góp thật cho từng nhu cầu) ──
export function getStoredContributions(supportNeedId?: string): SupportNeedContribution[] {
    const all = getStorageItem<SupportNeedContribution[]>(KEYS.CONTRIBUTIONS, memoryContributions);
    memoryContributions = all;
    if (!supportNeedId) return all;
    return all.filter((c) => c.supportNeedId === supportNeedId);
}

export function addStoredContribution(contribution: SupportNeedContribution): void {
    const current = getStorageItem<SupportNeedContribution[]>(KEYS.CONTRIBUTIONS, memoryContributions);
    const updated = [contribution, ...current];
    memoryContributions = updated;
    setStorageItem(KEYS.CONTRIBUTIONS, updated);

    // Cập nhật số lượng đã nhận của SupportNeed
    const allNeeds = getStoredNeeds();
    const needIndex = allNeeds.findIndex((n) => n.id === contribution.supportNeedId);
    if (needIndex !== -1) {
        const need = allNeeds[needIndex];
        const newReceived = need.receivedQuantity + contribution.quantity;
        const newRemaining = Math.max(0, need.requiredQuantity - newReceived);
        allNeeds[needIndex] = {
            ...need,
            receivedQuantity: newReceived,
            remainingQuantity: newRemaining,
            isFulfilled: newRemaining === 0,
            updatedAt: new Date().toISOString(),
        };
        saveStoredNeeds([...allNeeds]);
    }
}

// ── Volunteer Assignments Store (Chỉ lưu phân công tình nguyện thật) ──
export function getStoredAssignments(supportRequestId?: string, volunteerId?: string): VolunteerAssignment[] {
    const all = getStorageItem<VolunteerAssignment[]>(KEYS.ASSIGNMENTS, memoryAssignments);
    memoryAssignments = all;
    return all.filter((a) => {
        if (supportRequestId && a.supportRequestId !== supportRequestId) return false;
        if (volunteerId && a.volunteerId !== volunteerId) return false;
        return true;
    });
}

export function addStoredAssignment(assignment: VolunteerAssignment): void {
    const current = getStorageItem<VolunteerAssignment[]>(KEYS.ASSIGNMENTS, memoryAssignments);
    const updated = [assignment, ...current.filter((a) => !(a.supportRequestId === assignment.supportRequestId && a.volunteerId === assignment.volunteerId))];
    memoryAssignments = updated;
    setStorageItem(KEYS.ASSIGNMENTS, updated);
}

export function updateStoredAssignment(supportRequestId: string, volunteerId: string, status: VolunteerAssignment["status"], reason?: string): VolunteerAssignment | null {
    const current = getStorageItem<VolunteerAssignment[]>(KEYS.ASSIGNMENTS, memoryAssignments);
    const index = current.findIndex((a) => a.supportRequestId === supportRequestId && a.volunteerId === volunteerId);
    if (index === -1) return null;
    const updatedItem: VolunteerAssignment = {
        ...current[index],
        status,
        rejectionReason: reason ?? current[index].rejectionReason,
        updatedAt: new Date().toISOString(),
    };
    current[index] = updatedItem;
    memoryAssignments = [...current];
    setStorageItem(KEYS.ASSIGNMENTS, memoryAssignments);
    return updatedItem;
}

// ── Social Posts Store (Chỉ lưu và trả về bài viết thật của người dùng) ──
export function getStoredPosts(): PostSummaryResponse[] {
    const list = getStorageItem<PostSummaryResponse[]>(KEYS.POSTS, memoryPosts);
    memoryPosts = list;
    return list;
}

export function getStoredPost(id: string): PostSummaryResponse | null {
    const list = getStorageItem<PostSummaryResponse[]>(KEYS.POSTS, memoryPosts);
    memoryPosts = list;
    return list.find((p) => p.id === id) || null;
}

export function saveStoredPosts(posts: PostSummaryResponse[]): void {
    memoryPosts = posts;
    setStorageItem(KEYS.POSTS, posts);
}

export function addStoredPost(post: PostSummaryResponse): void {
    const current = getStoredPosts();
    const updated = [post, ...current.filter((p) => p.id !== post.id)];
    saveStoredPosts(updated);
}

export function deleteStoredPost(id: string): void {
    const current = getStoredPosts();
    saveStoredPosts(current.filter((p) => p.id !== id));
}

// ── Comments Store ──
export function getStoredComments(postId: string): PostComment[] {
    const all = getStorageItem<Record<string, PostComment[]>>(KEYS.COMMENTS, memoryComments);
    memoryComments = all;
    return all[postId] ?? [];
}

export function addStoredComment(postId: string, comment: PostComment): void {
    const all = getStorageItem<Record<string, PostComment[]>>(KEYS.COMMENTS, memoryComments);
    const currentList = all[postId] ?? [];
    all[postId] = [...currentList, comment];
    memoryComments = { ...all };
    setStorageItem(KEYS.COMMENTS, memoryComments);
}

export function deleteStoredComment(postId: string, commentId: string): void {
    const all = getStorageItem<Record<string, PostComment[]>>(KEYS.COMMENTS, memoryComments);
    const currentList = all[postId] ?? [];
    all[postId] = currentList.filter((c) => c.id !== commentId);
    memoryComments = { ...all };
    setStorageItem(KEYS.COMMENTS, memoryComments);
}

export function deleteStoredCommentById(commentId: string): void {
    const all = getStorageItem<Record<string, PostComment[]>>(KEYS.COMMENTS, memoryComments);
    for (const pId of Object.keys(all)) {
        all[pId] = all[pId].filter((c) => c.id !== commentId);
    }
    memoryComments = { ...all };
    setStorageItem(KEYS.COMMENTS, memoryComments);
}

// ── Reactions Store ──
export function getStoredReactionCount(postId: string): StoredReactionData {
    const all = getStorageItem<Record<string, StoredReactionData>>(KEYS.REACTIONS, memoryReactions);
    memoryReactions = all;
    const found = all[postId];
    if (found) return found;
    return {
        postId,
        totalCount: 0,
        countByType: { LIKE: 0, LOVE: 0, CARE: 0, SAD: 0, WOW: 0 },
    };
}

export function setStoredReaction(postId: string, type?: PostReactionType): void {
    const all = getStorageItem<Record<string, StoredReactionData>>(KEYS.REACTIONS, memoryReactions);
    const prev = all[postId] ?? {
        postId,
        totalCount: 0,
        countByType: { LIKE: 0, LOVE: 0, CARE: 0, SAD: 0, WOW: 0 },
    };

    if (prev.myReaction && prev.countByType[prev.myReaction] > 0) {
        prev.countByType[prev.myReaction]--;
        prev.totalCount = Math.max(0, prev.totalCount - 1);
    }

    if (type) {
        prev.countByType[type] = (prev.countByType[type] || 0) + 1;
        prev.totalCount++;
        prev.myReaction = type;
    } else {
        delete prev.myReaction;
    }

    all[postId] = prev;
    memoryReactions = { ...all };
    setStorageItem(KEYS.REACTIONS, memoryReactions);
}
