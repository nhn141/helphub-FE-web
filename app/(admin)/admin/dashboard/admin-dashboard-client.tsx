"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useAuth } from "@/components/auth-provider";
import { LoadingBlock, Notice, PageHeading } from "@/components/support-ui";
import {
    getAdminDashboardCategories,
    getAdminDashboardPosts,
    getAdminDashboardReports,
    getAdminDashboardSupportRequests,
    getAdminDashboardUsers,
    type CategoryDashboardStats,
    type PostDashboardStats,
    type ReportDashboardStats,
    type SupportRequestDashboardStats,
    type UserDashboardStats,
} from "@/lib/admin-api";

type ChartItem = {
    name: string;
    value: number;
    color?: string;
};

const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#f43f5e",
    "#64748b",
    "#14b8a6",
];

const REQUEST_STATUS_COLORS: Record<string, string> = {
    "Chờ phê duyệt": "#f59e0b",
    "Đã phê duyệt": "#10b981",
    "Đang thực hiện": "#3b82f6",
    "Đã hoàn thành": "#64748b",
    "Đã từ chối": "#f43f5e",
    "Đã hủy": "#94a3b8",
};

const REPORT_STATUS_COLORS: Record<string, string> = {
    "Chờ xử lý": "#f59e0b",
    "Đã xem xét": "#3b82f6",
    "Đã giải quyết": "#10b981",
};

export function AdminDashboardClient() {
    const { getAccessToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<UserDashboardStats | null>(null);
    const [requestStats, setRequestStats] =
        useState<SupportRequestDashboardStats | null>(null);
    const [categoryStats, setCategoryStats] =
        useState<CategoryDashboardStats | null>(null);
    const [postStats, setPostStats] = useState<PostDashboardStats | null>(null);
    const [reportStats, setReportStats] =
        useState<ReportDashboardStats | null>(null);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await getAccessToken();
            const [users, requests, categories, posts, reports] =
                await Promise.all([
                    getAdminDashboardUsers(token),
                    getAdminDashboardSupportRequests(token),
                    getAdminDashboardCategories(token),
                    getAdminDashboardPosts(token),
                    getAdminDashboardReports(token),
                ]);

            setUserStats(users);
            setRequestStats(requests);
            setCategoryStats(categories);
            setPostStats(posts);
            setReportStats(reports);
        } catch (loadError) {
            setError(getErrorMessage(loadError));
        } finally {
            setLoading(false);
        }
    }, [getAccessToken]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadDashboard();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadDashboard]);

    const userRoleData = useMemo<ChartItem[]>(
        () =>
            userStats
                ? [
                    {
                        name: "Người cần hỗ trợ",
                        value: userStats.requesters,
                    },
                    {
                        name: "Tình nguyện viên",
                        value: userStats.volunteers,
                    },
                    {
                        name: "Điều phối viên",
                        value: userStats.collaborators,
                    },
                    { name: "Quản trị viên", value: userStats.admins },
                ]
                : [],
        [userStats],
    );

    const requestStatusData = useMemo<ChartItem[]>(
        () =>
            requestStats
                ? [
                    { name: "Chờ phê duyệt", value: requestStats.pending },
                    { name: "Đã phê duyệt", value: requestStats.approved },
                    {
                        name: "Đang thực hiện",
                        value: requestStats.inProgress,
                    },
                    { name: "Đã hoàn thành", value: requestStats.completed },
                    { name: "Đã từ chối", value: requestStats.rejected },
                    { name: "Đã hủy", value: requestStats.cancelled },
                ].map((item) => ({
                    ...item,
                    color: REQUEST_STATUS_COLORS[item.name],
                }))
                : [],
        [requestStats],
    );

    const categoryData = useMemo<ChartItem[]>(
        () =>
            categoryStats?.categories.map((category) => ({
                name: category.categoryName,
                value: category.supportRequestCount,
            })) ?? [],
        [categoryStats],
    );

    const postStatusData = useMemo<ChartItem[]>(
        () =>
            postStats
                ? [
                    { name: "Hoạt động", value: postStats.active },
                    { name: "Đang kiểm duyệt", value: postStats.underReview },
                    { name: "Đã ẩn", value: postStats.hidden },
                    { name: "Đã gỡ bỏ", value: postStats.removed },
                ]
                : [],
        [postStats],
    );

    const reportStatusData = useMemo<ChartItem[]>(
        () =>
            reportStats
                ? [
                    {
                        name: "Chờ xử lý",
                        value: reportStats.pending,
                        color: REPORT_STATUS_COLORS["Chờ xử lý"],
                    },
                    {
                        name: "Đã xem xét",
                        value: reportStats.reviewed,
                        color: REPORT_STATUS_COLORS["Đã xem xét"],
                    },
                    {
                        name: "Đã giải quyết",
                        value: reportStats.resolved,
                        color: REPORT_STATUS_COLORS["Đã giải quyết"],
                    },
                ]
                : [],
        [reportStats],
    );

    const reportTargetData = useMemo<ChartItem[]>(
        () =>
            reportStats
                ? [
                    {
                        name: "Yêu cầu hỗ trợ",
                        value: reportStats.supportRequestReports,
                    },
                    { name: "Bài viết", value: reportStats.postReports },
                    { name: "Người dùng", value: reportStats.userReports },
                ]
                : [],
        [reportStats],
    );

    if (loading) {
        return <LoadingBlock message="Đang tải dữ liệu quản trị..." />;
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <PageHeading
                    eyebrow="Tổng quan hệ thống"
                    title="Bảng điều khiển quản trị"
                    description="Thống kê trực quan số liệu thời gian thực từ hệ thống HelpHub."
                />
                <button
                    type="button"
                    onClick={() => void loadDashboard()}
                    className="h-10 rounded-2xl border-2 border-slate-200 bg-white px-4 text-xs font-black text-slate-700 shadow-[0_2px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                    Làm mới
                </button>
            </div>

            {error ? (
                <Notice type="error">
                    {error}{" "}
                    <button
                        type="button"
                        onClick={() => void loadDashboard()}
                        className="font-semibold underline"
                    >
                        Thử lại
                    </button>
                </Notice>
            ) : null}

            {userStats && requestStats && categoryStats && postStats && reportStats ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <KpiCard
                            title="Người dùng"
                            value={userStats.totalUsers}
                            detail={`${userStats.activeUsers} đang hoạt động`}
                        />
                        <KpiCard
                            title="Yêu cầu hỗ trợ"
                            value={requestStats.totalSupportRequests}
                            detail={`${requestStats.pending} chờ phê duyệt`}
                        />
                        <KpiCard
                            title="Danh mục hỗ trợ"
                            value={categoryStats.totalCategories}
                            detail={`${categoryStats.activeCategories} đang sử dụng`}
                        />
                        <KpiCard
                            title="Bài viết"
                            value={postStats.totalPosts}
                            detail={`${postStats.underReview} đang kiểm duyệt`}
                        />
                        <KpiCard
                            title="Báo cáo vi phạm"
                            value={reportStats.totalReports}
                            detail={`${reportStats.pending} chờ xử lý`}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <StatCard title="Tài khoản người dùng">
                            <div className="mt-2 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Tổng số tài khoản
                                    </p>
                                    <span className="text-4xl font-black text-slate-800">
                                        {userStats.totalUsers}
                                    </span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <Badge tone="emerald">
                                        Hoạt động: {userStats.activeUsers}
                                    </Badge>
                                    <Badge tone="rose">
                                        Vô hiệu hóa: {userStats.inactiveUsers}
                                    </Badge>
                                </div>
                            </div>

                            <PiePanel data={userRoleData} />
                        </StatCard>

                        <StatCard title="Yêu cầu hỗ trợ">
                            <div className="mt-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Tổng yêu cầu gửi đến
                                </p>
                                <span className="text-4xl font-black text-slate-800">
                                    {requestStats.totalSupportRequests}
                                </span>
                            </div>

                            <PiePanel data={requestStatusData} />
                        </StatCard>

                        <StatCard title="Báo cáo vi phạm">
                            <div className="mt-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Hàng đợi kiểm duyệt
                                </p>
                                <span className="text-4xl font-black text-slate-800">
                                    {reportStats.totalReports}
                                </span>
                            </div>

                            <PiePanel data={reportStatusData} />
                        </StatCard>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <StatCard title="Yêu cầu theo Danh mục">
                            <BarPanel
                                data={categoryData}
                                emptyMessage="Chưa có dữ liệu yêu cầu theo danh mục."
                            />
                        </StatCard>

                        <StatCard title="Bài viết theo Trạng thái">
                            <BarPanel
                                data={postStatusData}
                                emptyMessage="Chưa có dữ liệu bài viết."
                            />
                        </StatCard>

                        <StatCard title="Báo cáo theo Đối tượng">
                            <BarPanel
                                data={reportTargetData}
                                emptyMessage="Chưa có dữ liệu báo cáo."
                            />
                        </StatCard>
                    </div>
                </>
            ) : null}
        </div>
    );
}

function KpiCard({
    title,
    value,
    detail,
}: {
    title: string;
    value: number;
    detail: string;
}) {
    return (
        <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                {title}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{detail}</p>
        </div>
    );
}

function StatCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex min-h-[360px] flex-col rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <h3 className="border-b border-slate-100 pb-3 text-xs font-black uppercase tracking-wider text-slate-800">
                {title}
            </h3>
            <div className="min-h-0 flex-1">{children}</div>
        </section>
    );
}

function PiePanel({ data }: { data: ChartItem[] }) {
    const visibleData = data.filter((item) => item.value > 0);

    if (!visibleData.length) {
        return <EmptyChart message="Chưa có dữ liệu thống kê để hiển thị." />;
    }

    return (
        <div className="mt-6 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={visibleData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={4}
                    >
                        {visibleData.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={
                                    entry.color ??
                                    COLORS[index % COLORS.length]
                                }
                            />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{
                            fontSize: "11px",
                            paddingTop: "10px",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

function BarPanel({
    data,
    emptyMessage,
}: {
    data: ChartItem[];
    emptyMessage: string;
}) {
    const visibleData = data.filter((item) => item.value > 0);

    if (!visibleData.length) {
        return <EmptyChart message={emptyMessage} />;
    }

    return (
        <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={visibleData}
                    margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
                >
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                        {visibleData.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={
                                    entry.color ??
                                    COLORS[index % COLORS.length]
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="mt-6 flex h-56 items-center justify-center rounded-2xl bg-slate-50 px-4 text-center text-sm font-medium text-slate-500 border border-slate-100">
            {message}
        </div>
    );
}

function Badge({
    tone,
    children,
}: {
    tone: "emerald" | "rose";
    children: React.ReactNode;
}) {
    const className =
        tone === "emerald"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-rose-50 text-rose-700 border border-rose-200";

    return (
        <div className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${className}`}>
            {children}
        </div>
    );
}

const tooltipStyle = {
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgb(15 23 42 / 0.12)",
    fontWeight: "bold",
} satisfies React.CSSProperties;

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Không thể tải dữ liệu bảng điều khiển quản trị.";
}
