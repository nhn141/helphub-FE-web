"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

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

    return (
        <div className="min-h-dvh bg-[#f4f6f2] text-slate-950 font-sans">
            {/* Desktop Duolingo-style Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-68 border-r-2 border-emerald-950/40 bg-[#10261f] text-white lg:flex lg:flex-col shadow-xl">
                <SidebarContent
                    pathname={pathname}
                    profileName={profile.fullName}
                    profileRole={ROLE_LABELS[profile.role]}
                    profileRoleValue={profile.role}
                    onLogout={logout}
                />
            </aside>

            {/* Mobile Drawer */}
            {mobileMenuOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className="relative flex h-full w-[min(86vw,320px)] flex-col bg-[#10261f] text-white shadow-2xl border-r-2 border-emerald-950/40">
                        <SidebarContent
                            pathname={pathname}
                            profileName={profile.fullName}
                            profileRole={ROLE_LABELS[profile.role]}
                            profileRoleValue={profile.role}
                            onNavigate={() => setMobileMenuOpen(false)}
                            onLogout={logout}
                        />
                    </aside>
                </div>
            ) : null}

            {/* Main content area */}
            <div className="lg:pl-68">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex size-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-0.5 active:shadow-none lg:hidden cursor-pointer"
                        >
                            <MenuIcon />
                        </button>
                        <div>
                            <p className="text-base font-black tracking-tight text-slate-900">
                                {getPageTitle(pathname)}
                            </p>
                            <p className="hidden text-xs font-semibold text-emerald-700/80 sm:block">
                                Hỗ trợ minh bạch • Kết nối kịp thời
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
    onNavigate,
    onLogout,
}: {
    pathname: string;
    profileName: string;
    profileRole: string;
    profileRoleValue: UserRole;
    onNavigate?: () => void;
    onLogout: () => void;
}) {
    return (
        <>
            {/* Duolingo Brand Header */}
            <div className="flex h-20 items-center gap-3.5 border-b-2 border-white/10 px-6">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white p-1.5 shadow-[0_4px_0_0_#059669]">
                    <HelpHubLogo className="size-full" />
                </div>
                <div>
                    <p className="text-xl font-black tracking-wide text-white">HelpHub</p>
                    <p className="text-[11px] font-bold text-emerald-300/80 uppercase tracking-wider">
                        Cổng hỗ trợ & kết nối
                    </p>
                </div>
            </div>

            {/* Navigation items Duolingo tactile style */}
            <nav className="flex-1 space-y-2 px-3.5 py-6">
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
                                className={`flex h-12 items-center gap-3.5 rounded-2xl px-4 text-sm font-black tracking-wide transition-all ${active
                                        ? "bg-emerald-400 text-[#10261f] shadow-[0_4px_0_0_#059669] border border-emerald-300"
                                        : "text-emerald-100/75 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <span className={`flex size-6 items-center justify-center shrink-0 ${active ? "text-[#10261f]" : "text-emerald-300"}`}>
                                    <Icon />
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
            </nav>

            {/* Duolingo-style Profile Card */}
            <div className="border-t-2 border-white/10 p-4">
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
