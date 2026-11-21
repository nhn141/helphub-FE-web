"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { Notice, LoadingBlock } from "@/components/support-ui";
import { HelpHubLogo } from "@/components/helphub-logo";

const adminNavigation = [
    { href: "/admin/dashboard", label: "Tổng quan", icon: DashboardIcon },
    { href: "/admin/users", label: "Quản lý Người dùng", icon: UsersIcon },
    {
        href: "/admin/support-requests",
        label: "Duyệt hỗ trợ",
        icon: RequestIcon,
    },
    {
        href: "/admin/reports",
        label: "Kiểm duyệt Báo cáo",
        icon: ShieldAlertIcon,
    },
    { href: "/admin/categories", label: "Danh mục Hỗ trợ", icon: FolderIcon },
    {
        href: "/admin/support-locations",
        label: "Điểm Tiếp nhận",
        icon: MapPinIcon,
    },
    {
        href: "/admin/role-upgrades",
        label: "Nâng cấp Vai trò",
        icon: ArrowUpCircleIcon,
    },
    {
        href: "/admin/community-funds",
        label: "Quỹ Cộng đồng",
        icon: WalletIcon,
    },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <AdminShell>{children}</AdminShell>
        </AuthProvider>
    );
}

function AdminShell({ children }: { children: ReactNode }) {
    const { profile, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!profile || profile.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [profile, router]);

    if (!profile || profile.role !== "ADMIN") {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-[#f4f6f2] p-4">
                <Notice type="error">Truy cập bị từ chối. Đang chuyển hướng...</Notice>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[#f4f6f2] text-slate-950">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-68 border-r-2 border-emerald-950/40 bg-[#10261f] text-white lg:flex lg:flex-col shadow-xl">
                <AdminSidebarContent
                    pathname={pathname}
                    profileName={profile.fullName}
                    onLogout={logout}
                />
            </aside>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className="relative flex h-full w-[min(86vw,320px)] flex-col bg-[#10261f] text-white shadow-2xl border-r-2 border-emerald-950/40">
                        <AdminSidebarContent
                            pathname={pathname}
                            profileName={profile.fullName}
                            onNavigate={() => setMobileMenuOpen(false)}
                            onLogout={logout}
                        />
                    </aside>
                </div>
            )}

            <div className="lg:pl-68">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex size-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-0.5 active:shadow-none lg:hidden cursor-pointer"
                        >
                            <MenuIcon />
                        </button>
                        <div>
                            <p className="text-base font-black tracking-tight text-slate-900">
                                HelpHub Quản trị hệ thống
                            </p>
                            <p className="hidden text-xs font-semibold text-emerald-700 sm:block">
                                Giám sát toàn diện & Kiểm duyệt tài nguyên
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-800 border-2 border-amber-300 shadow-[0_2px_0_0_#fde68a]">
                            Quản trị viên
                        </span>
                        <div className="flex size-10 items-center justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-100 text-sm font-black text-emerald-900 shadow-[0_2px_0_0_#a7f3d0]">
                            {profile.fullName
                                .split(" ")
                                .slice(-1)[0]
                                ?.charAt(0)
                                .toUpperCase() || "A"}
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

function AdminSidebarContent({
    pathname,
    profileName,
    onNavigate,
    onLogout,
}: {
    pathname: string;
    profileName: string;
    onNavigate?: () => void;
    onLogout: () => void;
}) {
    return (
        <>
            <div className="flex h-20 items-center gap-3.5 border-b-2 border-white/10 px-6">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white p-1.5 shadow-[0_4px_0_0_#d97706]">
                    <HelpHubLogo className="size-full" />
                </div>
                <div>
                    <p className="text-xl font-black tracking-wide text-white">
                        HelpHub Admin
                    </p>
                    <p className="text-[11px] font-bold text-amber-200/80 uppercase tracking-wider">
                        Không gian quản trị
                    </p>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5 px-3.5 py-5 overflow-y-auto">
                {adminNavigation.map((item) => {
                    const active =
                        pathname === item.href ||
                        (item.href !== "/admin/dashboard" &&
                            pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex h-11 items-center gap-3 rounded-2xl px-3.5 text-xs font-black tracking-wide transition-all ${active
                                    ? "bg-amber-400 text-[#10261f] shadow-[0_3px_0_0_#d97706] border border-amber-300"
                                    : "text-white/75 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <span className={active ? "text-[#10261f]" : "text-amber-300"}>
                                <Icon />
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t-2 border-white/10 p-4">
                <div className="rounded-2xl border-2 border-white/15 bg-white/5 p-3.5 shadow-sm">
                    <p className="truncate text-xs font-black text-white">
                        {profileName}
                    </p>
                    <span className="inline-block mt-0.5 rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                        Quản trị hệ thống
                    </span>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="mt-3 flex h-8 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-xs font-bold text-white/80 shadow-[0_2px_0_0_rgba(255,255,255,0.1)] hover:bg-white/10 hover:text-white active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </>
    );
}

function DashboardIcon() {
    return (
        <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
        </svg>
    );
}

function RequestIcon() {
    return (
        <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
        </svg>
    );
}

function ShieldAlertIcon() {
    return (
        <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
    );
}

function FolderIcon() {
    return (
        <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
        </svg>
    );
}

function MapPinIcon() {
    return (
        <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
    );
}

function ArrowUpCircleIcon() {
    return (
        <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
            />
        </svg>
    );
}

function WalletIcon() {
    return (
        <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 17h16"
            />
        </svg>
    );
}
