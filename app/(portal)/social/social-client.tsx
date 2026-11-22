"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    HeartHandshake,
    ShieldCheck,
    Hash,
    MapPin,
    FileText,
    PlusCircle,
    ArrowUpRight,
    Users,
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
                eyebrow="Mạng lưới hỗ trợ cộng đồng"
                title="Bảng tin cộng đồng"
                description="Nơi kết nối các hoàn cảnh khó khăn với những tấm lòng tình nguyện, cùng nhau sẻ chia và lan tỏa những câu chuyện ấm áp."
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
                                    ? "Chưa có bài đăng nào trên bảng tin"
                                    : "Bạn chưa đăng bài viết nào"
                            }
                            description={
                                activeTab === "ALL"
                                    ? "Hãy chia sẻ câu chuyện đẹp, giới thiệu hoàn cảnh cần giúp đỡ hoặc kết nối cùng các tình nguyện viên khác."
                                    : "Các bài viết bạn đã đăng sẽ xuất hiện tại đây."
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

                {/* Right Sidebar: Community Volunteering Widgets */}
                <div className="space-y-5 hidden lg:block">
                    {/* Widget 1: Volunteering Focus Areas */}
                    <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-[0_2px_0_0_#a7f3d0]">
                                <HeartHandshake className="size-4.5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm leading-snug">
                                    Hoàn cảnh cần giúp đỡ
                                </h3>
                                <p className="text-[11px] font-bold text-emerald-700">
                                    Cùng chung tay hỗ trợ
                                </p>
                            </div>
                        </div>

                        <div className="mt-3.5 space-y-2 border-t-2 border-slate-100 pt-3 text-xs">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                                <p className="font-bold text-slate-900">
                                    Tiếp sức đến trường
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Tặng sách vở, đồ dùng học tập và học bổng cho học sinh nghèo vượt khó.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                                <p className="font-bold text-slate-900">
                                    Người già neo đơn
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Thăm hỏi, chăm sóc sinh hoạt và hỗ trợ nhu yếu phẩm định kỳ.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                                <p className="font-bold text-slate-900">
                                    Hỗ trợ người yếu thế
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Đồng hành cùng người khuyết tật và các gia đình có hoàn cảnh khó khăn.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/support-requests"
                            className="mt-3.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white text-xs font-black text-slate-700 shadow-[0_2px_0_0_#cbd5e1] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                        >
                            <span>Xem danh sách hoàn cảnh</span>
                            <ArrowUpRight className="size-3.5" />
                        </Link>
                    </div>

                    {/* Widget 2: Quick Actions */}
                    <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 shadow-xs space-y-2.5">
                        <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">
                            Thao tác nhanh
                        </h3>

                        <Link
                            href="/support-requests/new"
                            className="flex items-center justify-between rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-xs font-black text-emerald-950 shadow-[0_2px_0_0_#a7f3d0] hover:bg-emerald-100 transition active:translate-y-0.5 active:shadow-none"
                        >
                            <span className="flex items-center gap-2">
                                <PlusCircle className="size-4 text-emerald-700" />
                                Gửi hoàn cảnh cần giúp đỡ
                            </span>
                            <ArrowUpRight className="size-3.5" />
                        </Link>

                        <Link
                            href="/support-locations"
                            className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 text-xs font-black text-slate-700 shadow-[0_2px_0_0_#cbd5e1] hover:bg-slate-100 hover:border-slate-300 transition active:translate-y-0.5 active:shadow-none"
                        >
                            <span className="flex items-center gap-2">
                                <MapPin className="size-4 text-emerald-600" />
                                Điểm tiếp nhận & quyên góp
                            </span>
                            <ArrowUpRight className="size-3.5" />
                        </Link>

                        <Link
                            href="/support-requests"
                            className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 text-xs font-black text-slate-700 shadow-[0_2px_0_0_#cbd5e1] hover:bg-slate-100 hover:border-slate-300 transition active:translate-y-0.5 active:shadow-none"
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="size-4 text-slate-600" />
                                Danh sách các hoàn cảnh
                            </span>
                            <ArrowUpRight className="size-3.5" />
                        </Link>
                    </div>

                    {/* Widget 3: Trending Topics */}
                    <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center gap-2">
                            <Hash className="size-4 text-emerald-700" />
                            <h3 className="font-black text-slate-900 text-sm">
                                Chủ đề quan tâm
                            </h3>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {[
                                "#TiepSucDenTruong",
                                "#NguoiGiaNeoDon",
                                "#NhuYeuPham",
                                "#NhomTinhNguyen",
                                "#NuCuoiTreTho",
                                "#TraoYeuThuong",
                            ].map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer transition"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Widget 4: Community Guidelines */}
                    <div className="rounded-3xl border-2 border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-600 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                            <ShieldCheck className="size-4 text-emerald-700" />
                            <span>Nguyên tắc chia sẻ văn minh</span>
                        </div>
                        <ul className="space-y-1.5 list-disc list-inside font-medium leading-relaxed text-[11px] text-slate-600">
                            <li>Tôn trọng danh dự và quyền riêng tư của người được giúp đỡ.</li>
                            <li>Nêu rõ hoàn cảnh cụ thể, địa chỉ và thông tin người bảo trợ xác minh.</li>
                            <li>Chủ động cập nhật khi hoàn cảnh đã nhận đủ sự hỗ trợ.</li>
                            <li>Tất cả vì tinh thần thiện nguyện tự nguyện, minh bạch và phi lợi nhuận.</li>
                        </ul>
                        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                            © 2026 HelpHub • Mạng xã hội hỗ trợ cộng đồng
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
