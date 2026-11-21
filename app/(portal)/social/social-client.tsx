"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Sparkles,
    HeartHandshake,
    ShieldCheck,
    Users,
    ArrowUpRight,
    MessageSquare,
    Zap,
} from "lucide-react";
import { getPosts, getMyPosts, PostSummaryResponse } from "@/lib/social-api";
import { getValidSession } from "@/lib/session";
import { SocialPostCard } from "@/components/social/social_post_card";
import {
    EmptyState,
    LoadingBlock,
    Notice,
    PageHeading,
} from "@/components/support-ui";
import { SocialPostForm } from "@/components/social/social_post_form";

type TabType = "ALL" | "MY_POSTS";

export function SocialClient() {
    const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState<TabType>("ALL");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const session = await getValidSession();

            if (!session) {
                setError("Vui lòng đăng nhập để xem bảng tin cộng đồng.");
                setIsLoading(false);
                return;
            }

            setAccessToken(session.accessToken);

            const data =
                activeTab === "ALL"
                    ? await getPosts(session.accessToken)
                    : await getMyPosts(session.accessToken);

            setPosts(data);
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách bài viết.");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadData, refreshKey]);

    const handlePostCreated = () => {
        setRefreshKey((prev) => prev + 1);
        setActiveTab("ALL");
    };

    const handlePostRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeading
                eyebrow="Cộng đồng sẻ chia"
                title="Bảng tin kết nối"
                description="Chia sẻ cập nhật, phối hợp nguồn lực và gắn kết mọi tấm lòng hảo tâm."
            />

            {/* Error Notice */}
            {error ? (
                <Notice type="error">
                    {error}{" "}
                    <button
                        type="button"
                        className="font-black underline"
                        onClick={() => void loadData()}
                    >
                        Thử lại
                    </button>
                </Notice>
            ) : null}

            {/* Twitter-style 2-Column Layout */}
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                {/* Central Newsfeed Column */}
                <div className="space-y-5">
                    {/* Twitter-style Sticky Tab Header */}
                    <div className="sticky top-16 z-20 rounded-3xl border-2 border-slate-200/90 bg-white/90 backdrop-blur-md shadow-xs overflow-hidden">
                        <div className="flex border-b-2 border-slate-100">
                            <button
                                type="button"
                                onClick={() => setActiveTab("ALL")}
                                className="flex-1 py-3.5 text-center transition cursor-pointer relative hover:bg-slate-50/80"
                            >
                                <span
                                    className={`text-sm tracking-wide ${activeTab === "ALL"
                                            ? "font-black text-slate-900"
                                            : "font-bold text-slate-500 hover:text-slate-800"
                                        }`}
                                >
                                    Khám phá (Tất cả)
                                </span>
                                {activeTab === "ALL" && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full bg-emerald-600 shadow-[0_1px_3px_0_rgba(5,150,105,0.4)]" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("MY_POSTS")}
                                className="flex-1 py-3.5 text-center transition cursor-pointer relative hover:bg-slate-50/80"
                            >
                                <span
                                    className={`text-sm tracking-wide ${activeTab === "MY_POSTS"
                                            ? "font-black text-slate-900"
                                            : "font-bold text-slate-500 hover:text-slate-800"
                                        }`}
                                >
                                    Bài viết của tôi
                                </span>
                                {activeTab === "MY_POSTS" && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full bg-emerald-600 shadow-[0_1px_3px_0_rgba(5,150,105,0.4)]" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Twitter-style Composer Box */}
                    {accessToken && (
                        <SocialPostForm
                            accessToken={accessToken}
                            onPostCreated={handlePostCreated}
                        />
                    )}

                    {/* Posts Stream */}
                    {isLoading ? (
                        <LoadingBlock message="Đang tải các bài viết từ cộng đồng..." />
                    ) : posts.length === 0 ? (
                        <EmptyState
                            title={
                                activeTab === "ALL"
                                    ? "Chưa có bài viết nào trên bảng tin"
                                    : "Bạn chưa đăng bài viết nào"
                            }
                            description={
                                activeTab === "ALL"
                                    ? "Hãy là người đầu tiên mở lời chia sẻ câu chuyện hoặc cập nhật thông tin hỗ trợ!"
                                    : "Chia sẻ tiến độ hoặc tình hình thực tế để mọi người cùng nắm bắt."
                            }
                        />
                    ) : (
                        <div className="space-y-4">
                            {posts.map(
                                (post) =>
                                    accessToken && (
                                        <SocialPostCard
                                            key={post.id}
                                            post={post}
                                            accessToken={accessToken}
                                            onDelete={handlePostRefresh}
                                        />
                                    ),
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Duolingo & Twitter Widgets */}
                <div className="space-y-5 hidden lg:block">
                    {/* Widget 1: Duolingo Community Mission Card */}
                    <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-[0_2px_0_0_#a7f3d0]">
                                <Sparkles className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-base leading-snug">
                                    Sứ mệnh HelpHub
                                </h3>
                                <p className="text-xs font-semibold text-emerald-700">
                                    Lan tỏa yêu thương
                                </p>
                            </div>
                        </div>

                        <p className="mt-3.5 text-xs font-medium leading-relaxed text-slate-600">
                            Mỗi bài đăng chia sẻ là một nhịp cầu kết nối người cần giúp đỡ đến những trái tim thiện nguyện kịp thời nhất.
                        </p>

                        <div className="mt-4 space-y-2.5 border-t-2 border-slate-100 pt-3.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="size-4 text-emerald-600" />
                                    Minh bạch 100%
                                </span>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-200">
                                    Xác thực
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1.5">
                                    <HeartHandshake className="size-4 text-emerald-600" />
                                    Hỗ trợ trực tiếp
                                </span>
                                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-black text-sky-800 border border-sky-200">
                                    24/7
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Widget 2: Quick Campaign Discovery */}
                    <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4 text-amber-500" />
                            <h3 className="font-black text-slate-900 text-sm">
                                Yêu cầu cần hỗ trợ
                            </h3>
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                            Khám phá các hoàn cảnh và khu vực đang cần tình nguyện viên chung tay.
                        </p>

                        <Link
                            href="/support-requests"
                            className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-xs font-black text-slate-700 shadow-[0_2px_0_0_#cbd5e1] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                        >
                            <span>Xem danh sách yêu cầu</span>
                            <ArrowUpRight className="size-3.5" />
                        </Link>
                    </div>

                    {/* Widget 3: Community Guidelines */}
                    <div className="rounded-3xl border-2 border-slate-200 bg-slate-50/60 p-5 text-xs text-slate-500 space-y-2">
                        <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                            Quy tắc bảng tin:
                        </p>
                        <ul className="space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                            <li>Chia sẻ thông tin chân thực, có tâm.</li>
                            <li>Tôn trọng người gặp khó khăn và tình nguyện viên.</li>
                            <li>Đính kèm ảnh thực tế nếu có để tăng độ xác thực.</li>
                        </ul>
                        <p className="text-[11px] text-slate-400 pt-1">
                            © HelpHub Community • Chung tay vì cộng đồng
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
