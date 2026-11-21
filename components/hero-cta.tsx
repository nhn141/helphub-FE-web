"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export function HeroCTA() {
  const router = useRouter();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href="/login?mode=register&role=REQUESTER"
        onClick={(e) => handleNav(e, "/login?mode=register&role=REQUESTER")}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-[0_4px_0_0_#065f46] transition hover:bg-emerald-800 active:translate-y-0.5 active:shadow-none cursor-pointer"
      >
        Tôi cần hỗ trợ
        <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
          <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
        </svg>
      </Link>

      <Link
        href="/login?mode=register&role=VOLUNTEER"
        onClick={(e) => handleNav(e, "/login?mode=register&role=VOLUNTEER")}
        className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-emerald-200 bg-white px-6 text-sm font-bold text-emerald-800 shadow-[0_4px_0_0_#a7f3d0] transition hover:border-emerald-300 hover:bg-emerald-50 active:translate-y-0.5 active:shadow-none cursor-pointer"
      >
        Trở thành tình nguyện viên
      </Link>
    </div>
  );
}
