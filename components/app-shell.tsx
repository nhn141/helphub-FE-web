"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/auth-provider";
import { NotificationBell } from "@/components/notification-bell";
import { HelpHubLogo } from "@/components/helphub-logo";
import type { UserRole } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/support-request-ui";

type NavigationItem = {
    href: string;
    label: string;
    icon: () => ReactNode;
    roles?: UserRole[];
};

const navigation: NavigationItem[] = [
    {
        href: "/dashboard",
        label: "Tổng quan",
        icon: HomeIcon,
    },
    {
        href: "/support-requests",
        label: "Yêu cầu hỗ trợ",
        icon: SupportIcon,
    },
    {
        href: "/support-locations",
        label: "Điểm tiếp nhận",
        icon: LocationHubIcon,
        roles: ["ADMIN", "COLLABORATOR"],
    },
    {
        href: "/social",
        label: "Bảng tin cộng đồng",
        icon: UsersIcon,
    },
    {
        href: "/messages",
        label: "Tin nhắn",
        icon: MessageIcon,
    },
];

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { profile, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("helphub_sidebar_collapsed");
            if (saved !== null) {
                setIsCollapsed(saved === "true");
            }
        } catch {
            // ignore localStorage unavailable
        }
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem("helphub_sidebar_collapsed", String(next));
            } catch {
                // ignore
            }
            return next;
        });
    };

    return (
        <div className="min-h-dvh bg-[#f4f6f2] text-slate-950 font-sans">
            {/* Desktop Duolingo-style Collapsible Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 hidden border-r-2 border-emerald-950/40 bg-[#10261f] text-white lg:flex lg:flex-col shadow-xl overflow-x-hidden transition-all duration-300 ease-in-out ${
                    isCollapsed ? "w-20" : "w-68"
                }`}
            >
                <SidebarContent
                    pathname={pathname}
                    profileName={profile.fullName}
                    profileRole={ROLE_LABELS[profile.role]}
                    profileRoleValue={profile.role}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={toggleCollapse}
                    onLogout={logout}
                />
            </aside>

            {/* Mobile Drawer */}
            {mobileMenuOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Đóng menu"
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className="relative flex h-full w-[min(86vw,320px)] flex-col bg-[#10261f] text-white shadow-2xl border-r-2 border-emerald-950/40 animate-in slide-in-from-left duration-200">
                        <SidebarContent
                            pathname={pathname}
                            profileName={profile.fullName}
                            profileRole={ROLE_LABELS[profile.role]}
                            profileRoleValue={profile.role}
                            isCollapsed={false}
                            isMobileDrawer={true}
                            onToggleCollapse={() => setMobileMenuOpen(false)}
                            onNavigate={() => setMobileMenuOpen(false)}
                            onLogout={logout}
                        />
                    </aside>
                </div>
            ) : null}

            {/* Main content area */}
            <div
                className={`transition-[padding-left] duration-300 ease-in-out ${
                    isCollapsed ? "lg:pl-20" : "lg:pl-68"
                }`}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 shadow-xs">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger button */}
                        <button
                            type="button"
                            aria-label="Mở menu"
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex size-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-0.5 active:shadow-none lg:hidden cursor-pointer"
                        >
                            <MenuIcon />
                        </button>

                        {/* Desktop sidebar collapse/expand toggle button */}
                        <button
                            type="button"
                            aria-label={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                            title={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                            onClick={toggleCollapse}
                            className="hidden size-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 shadow-[0_2px_0_0_#cbd5e1] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none lg:flex cursor-pointer transition"
                        >
                            <PanelLeftIcon collapsed={isCollapsed} />
                        </button>

                        <div>
                            <p className="text-base font-black tracking-tight text-slate-900">
                                {getPageTitle(pathname)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {profile.role === "REQUESTER" ? (
                            <Link
                                href="/support-requests/new"
                                className="hidden h-10 items-center gap-2 rounded-2xl bg-emerald-600 px-4 text-xs sm:text-sm font-black text-white shadow-[0_3px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-0.5 active:shadow-none transition-all sm:flex"
                            >
                                <PlusIcon />
                                Tạo yêu cầu
                            </Link>
                        ) : null}
                        <NotificationBell />
                        <Link
                            href="/profile"
                            className="flex size-10 items-center justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-100 text-sm font-black text-emerald-900 shadow-[0_2px_0_0_#a7f3d0] hover:bg-emerald-200 active:translate-y-0.5 active:shadow-none transition"
                            title={profile.fullName}
                        >
                            {getInitials(profile.fullName)}
                        </Link>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarContent({
    pathname,
    profileName,
    profileRole,
    profileRoleValue,
    isCollapsed = false,
    onToggleCollapse,
    isMobileDrawer = false,
    onNavigate,
    onLogout,
}: {
    pathname: string;
    profileName: string;
    profileRole: string;
    profileRoleValue: UserRole;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    isMobileDrawer?: boolean;
    onNavigate?: () => void;
    onLogout: () => void;
}) {
    return (
        <>
            {/* Duolingo Brand Header */}
            <div
                className={`flex h-20 items-center border-b-2 border-white/10 ${
                    isCollapsed ? "justify-center px-2" : "justify-between px-5"
                }`}
            >
                <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "justify-center" : ""}`}>
                    <button
                        type="button"
                        onClick={isCollapsed ? onToggleCollapse : undefined}
                        title={isCollapsed ? "Mở rộng thanh bên" : "HelpHub"}
                        className={`flex size-11 items-center justify-center rounded-2xl bg-white p-1.5 shadow-[0_4px_0_0_#059669] shrink-0 ${
                            isCollapsed ? "cursor-pointer hover:scale-105 active:scale-95 transition" : ""
                        }`}
                    >
                        <HelpHubLogo className="size-full" />
                    </button>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="text-xl font-black tracking-wide text-white truncate">HelpHub</p>
                            <p className="text-[11px] font-bold text-emerald-300/80 uppercase tracking-wider truncate">
                                Cổng hỗ trợ & kết nối
                            </p>
                        </div>
                    )}
                </div>

                {isMobileDrawer ? (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        aria-label="Đóng thanh bên"
                        className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-emerald-200 hover:bg-white/20 hover:text-white transition cursor-pointer"
                    >
                        <CloseIcon />
                    </button>
                ) : null}
            </div>

            {/* Navigation items Duolingo tactile style */}
            <nav
                className={`flex-1 space-y-2 py-6 overflow-y-auto ${
                    isCollapsed ? "px-2" : "px-3.5"
                }`}
            >
                {navigation
                    .filter(
                        (item) =>
                            !item.roles ||
                            item.roles.includes(profileRoleValue),
                    )
                    .map((item) => {
                        const active =
                            pathname === item.href ||
                            (item.href !== "/dashboard" &&
                                pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                title={item.label}
                                className={`flex h-12 items-center rounded-2xl transition-all ${
                                    isCollapsed
                                        ? "justify-center w-12 mx-auto px-0"
                                        : "gap-3.5 px-4"
                                } ${
                                    active
                                        ? "bg-emerald-400 text-[#10261f] shadow-[0_4px_0_0_#059669] border border-emerald-300"
                                        : "text-emerald-100/75 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <span className={`flex size-6 items-center justify-center shrink-0 ${active ? "text-[#10261f]" : "text-emerald-300"}`}>
                                    <Icon />
                                </span>
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
            </nav>

            {/* Duolingo-style Profile Card */}
            <div className="border-t-2 border-white/10 p-3 sm:p-4">
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-2.5">
                        <Link
                            href="/profile"
                            onClick={onNavigate}
                            title={`${profileName} (${profileRole}) - Xem hồ sơ`}
                            className="flex size-11 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-black text-sm hover:bg-emerald-400/30 transition shadow-sm"
                        >
                            {getInitials(profileName)}
                        </Link>
                        <button
                            type="button"
                            onClick={onLogout}
                            title="Đăng xuất"
                            aria-label="Đăng xuất"
                            className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                        >
                            <LogoutIcon />
                        </button>
                    </div>
                ) : (
                    <div className="rounded-2xl border-2 border-white/15 bg-white/5 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-black text-sm">
                                {getInitials(profileName)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-black text-white">
                                    {profileName}
                                </p>
                                <span className="inline-block mt-0.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                                    {profileRole}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3.5 flex gap-2">
                            <Link
                                href="/profile"
                                onClick={onNavigate}
                                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/15 text-xs font-bold text-emerald-200 shadow-[0_2px_0_0_rgba(16,185,129,0.2)] hover:bg-emerald-500/25 active:translate-y-0.5 active:shadow-none transition"
                            >
                                <UserIcon />
                                Hồ sơ
                            </Link>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-bold text-white/80 shadow-[0_2px_0_0_rgba(255,255,255,0.1)] hover:bg-white/10 hover:text-white active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                                title="Đăng xuất"
                            >
                                <LogoutIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function getPageTitle(pathname: string): string {
    if (pathname === "/support-requests/new") {
        return "Tạo yêu cầu hỗ trợ";
    }

    if (pathname.includes("/edit")) {
        return "Chỉnh sửa yêu cầu";
    }

    if (pathname.startsWith("/support-requests/")) {
        return "Chi tiết yêu cầu";
    }

    if (pathname.startsWith("/support-requests")) {
        return "Danh sách yêu cầu";
    }

    if (pathname.startsWith("/support-locations")) {
        return "Điểm tiếp nhận hỗ trợ";
    }

    if (pathname.startsWith("/social")) {
        return "Bảng tin cộng đồng";
    }

    if (pathname.startsWith("/messages")) {
        return "Hộp thư nhắn tin";
    }

    if (pathname.startsWith("/profile")) {
        return "Hồ sơ cá nhân";
    }

    return "Tổng quan";
}

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function HomeIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
        >
            <path
                d="m3 10 9-7 9 7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M5 9.5V21h14V9.5M9 21v-7h6v7" strokeLinejoin="round" />
        </svg>
    );
}

function SupportIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
        >
            <path
                d="M12 21s-8-4.7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.3-8 11-8 11Z"
                strokeLinejoin="round"
            />
            <path d="M8.5 12h7M12 8.5v7" strokeLinecap="round" />
        </svg>
    );
}

function LocationHubIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 21s6-5.4 6-11a6 6 0 0 0-12 0c0 5.6 6 11 6 11Z" />
            <circle cx="12" cy="10" r="2.3" />
            <path d="M5 21h14" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function MessageIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
        >
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="14" cy="7" r="4" />
        </svg>
    );
}

function PanelLeftIcon({ collapsed }: { collapsed?: boolean }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            {collapsed ? (
                <path d="m14 9 3 3-3 3" />
            ) : (
                <path d="m17 15-3-3 3-3" />
            )}
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
        >
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}
