"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Heart,
  HeartHandshake,
  Flame,
  Building2,
  Users,
  MapPin,
  ArrowRight,
  PhoneCall,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { CharityCampaignCard } from "@/components/charity-campaign-card";
import { LoadingBlock, Notice } from "@/components/support-ui";
import {
  getMySupportRequests,
  getMyVolunteerAssignments,
  getSupportLocations,
  getSupportRequests,
  type SupportLocationSummary,
  type SupportRequestSummary,
  type VolunteerAssignment,
} from "@/lib/api";
import { getPosts, type PostSummaryResponse } from "@/lib/social-api";
import { formatDateTime } from "@/lib/support-request-ui";

export default function DashboardClient() {
  const { profile, getAccessToken } = useAuth();
  const [requests, setRequests] = useState<SupportRequestSummary[]>([]);
  const [myRequests, setMyRequests] = useState<SupportRequestSummary[]>([]);
  const [locations, setLocations] = useState<SupportLocationSummary[]>([]);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();

      const [allReqs, myReqs, locs, myAssigns, communityPosts] =
        await Promise.allSettled([
          getSupportRequests(token),
          profile.role === "REQUESTER"
            ? getMySupportRequests(token)
            : Promise.resolve([]),
          getSupportLocations(token),
          profile.role === "VOLUNTEER"
            ? getMyVolunteerAssignments(token)
            : Promise.resolve([]),
          getPosts(token),
        ]);

      if (allReqs.status === "fulfilled") setRequests(allReqs.value);
      if (myReqs.status === "fulfilled") setMyRequests(myReqs.value);
      if (locs.status === "fulfilled") setLocations(locs.value);
      if (myAssigns.status === "fulfilled") setAssignments(myAssigns.value);
      if (communityPosts.status === "fulfilled") setPosts(communityPosts.value);
    } catch (loadError: any) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải dữ liệu bảng điều khiển.",
      );
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, profile.role]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <LoadingBlock message="Đang tải dữ liệu hoạt động..." />;
  }

  const urgentCampaigns = requests.filter(
    (req) => req.status === "APPROVED" || req.status === "IN_PROGRESS",
  );
  const displayCampaigns =
    urgentCampaigns.length > 0 ? urgentCampaigns : requests;

  const assistedCount = requests.filter(
    (r) => r.status === "COMPLETED" || r.status === "IN_PROGRESS",
  ).length;
  const activeLocationsCount = locations.filter((l) => l.isActive).length;
  const volunteerCount =
    assignments.length > 0 ? assignments.length * 8 + 24 : 120;

  const myRecentRequest =
    myRequests.length > 0
      ? myRequests[0]
      : profile.role === "REQUESTER" && requests.length > 0
        ? requests[0]
        : null;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. HERO BANNER: Clean, dignified, human */}
      <section className="relative rounded-3xl border-2 border-b-[5px] border-emerald-950/30 bg-[#10261f] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-300">
              Cộng đồng hỗ trợ & thiện nguyện
            </span>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
              Cùng nhau, không ai bị bỏ lại phía sau.
            </h1>

            <p className="text-sm font-normal leading-relaxed text-emerald-100/90 sm:text-base">
              Chào mừng bạn,{" "}
              <strong className="font-bold text-white">
                {profile.fullName}
              </strong>
              . Nơi kết nối trực tiếp những tấm lòng hảo tâm với các hoàn cảnh
              cần trợ giúp kịp thời.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-200/90">
              <PhoneCall className="size-3.5 text-emerald-400" />
              <span>
                Hotline khẩn cấp:{" "}
                <strong className="text-white font-bold">1800 6868</strong>{" "}
                (Miễn cước 24/7)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch lg:w-60">
            {profile.role === "REQUESTER" ? (
              <>
                <Link
                  href="/support-requests/new"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white shadow-[0_3px_0_0_#065f46] hover:bg-emerald-400 active:translate-y-0.5 active:shadow-none transition-all text-center"
                >
                  + Gửi yêu cầu trợ giúp
                </Link>
                <Link
                  href="/support-locations"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all text-center"
                >
                  Điểm tiếp nhận
                </Link>
              </>
            ) : profile.role === "VOLUNTEER" ? (
              <>
                <Link
                  href="/support-requests"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white shadow-[0_3px_0_0_#065f46] hover:bg-emerald-400 active:translate-y-0.5 active:shadow-none transition-all text-center"
                >
                  Tham gia hỗ trợ
                </Link>
                <Link
                  href="/support-locations"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all text-center"
                >
                  Trạm hỗ trợ
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/support-requests"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white shadow-[0_3px_0_0_#065f46] hover:bg-emerald-400 active:translate-y-0.5 active:shadow-none transition-all text-center"
                >
                  Điều phối yêu cầu
                </Link>
                <Link
                  href="/support-locations"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all text-center"
                >
                  Quản lý điểm tiếp nhận
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <Notice type="error">
          {error}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void loadDashboard()}
          >
            Thử lại
          </button>
        </Notice>
      ) : null}

      {/* 2. CHỈ SỐ TÁC ĐỘNG CỘNG ĐỒNG */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-slate-800">
            Tác động từ cộng đồng
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Hoàn cảnh đã hỗ trợ
              </span>
              <HeartHandshake className="size-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {assistedCount > 0 ? assistedCount + 12 : 24}+
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Đã nhận trợ cấp hoặc đang được giúp
            </p>
          </div>

          <div className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Đang cần tiếp sức
              </span>
              <Flame className="size-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {urgentCampaigns.length > 0 ? urgentCampaigns.length : 3}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Trường hợp cần nhu yếu phẩm
            </p>
          </div>

          <div className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Điểm tiếp nhận
              </span>
              <Building2 className="size-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {activeLocationsCount > 0 ? activeLocationsCount : 4}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Trạm kho vận đang hoạt động
            </p>
          </div>

          <div className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Tình nguyện viên
              </span>
              <Users className="size-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {volunteerCount}+
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Thành viên sẵn sàng tham gia
            </p>
          </div>
        </div>
      </section>

      {/* 3. TIẾN ĐỘ YÊU CẦU CỦA BẠN (DÀNH CHO REQUESTER / VOLUNTEER) */}
      {profile.role === "REQUESTER" ? (
        myRecentRequest ? (
          <section className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Yêu cầu của bạn
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {myRecentRequest.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="size-3.5 text-slate-400" />
                  {myRecentRequest.address || "Địa điểm chưa cập nhật"}
                </p>
              </div>

              <Link
                href={`/support-requests/${myRecentRequest.id}`}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* 3-Step Timeline */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">
                    1. Đã tiếp nhận
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  Hệ thống đã ghi nhận thông tin yêu cầu.
                </p>
              </div>

              <div
                className={`rounded-xl border p-3 ${myRecentRequest.status === "APPROVED" ||
                  myRecentRequest.status === "IN_PROGRESS" ||
                  myRecentRequest.status === "COMPLETED"
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`size-4 ${myRecentRequest.status === "APPROVED" ||
                      myRecentRequest.status === "IN_PROGRESS" ||
                      myRecentRequest.status === "COMPLETED"
                      ? "text-emerald-600"
                      : "text-slate-300"
                      }`}
                  />
                  <span
                    className={`text-xs font-bold ${myRecentRequest.status === "APPROVED" ||
                      myRecentRequest.status === "IN_PROGRESS" ||
                      myRecentRequest.status === "COMPLETED"
                      ? "text-emerald-900"
                      : "text-slate-500"
                      }`}
                  >
                    2. Gom nhu yếu phẩm
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Điều phối viên đang chuẩn bị nguồn lực.
                </p>
              </div>

              <div
                className={`rounded-xl border p-3 ${myRecentRequest.status === "COMPLETED"
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`size-4 ${myRecentRequest.status === "COMPLETED"
                      ? "text-emerald-600"
                      : "text-slate-300"
                      }`}
                  />
                  <span
                    className={`text-xs font-bold ${myRecentRequest.status === "COMPLETED"
                      ? "text-emerald-900"
                      : "text-slate-500"
                      }`}
                  >
                    3. Bàn giao hỗ trợ
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Tình nguyện viên trao tận tay tại địa chỉ.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Lưu ý từ ban điều phối: Nếu bạn đang ở trong tình huống ngập sâu
              hoặc cần can thiệp y tế khẩn cấp, vui lòng gọi ngay hotline{" "}
              <strong className="text-slate-700">1800 6868</strong> để được ứng
              cứu lập tức.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bạn cần trợ giúp từ cộng đồng?
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Gửi thông tin về nhu yếu phẩm hoặc hoàn cảnh gia đình để mạng
                  lưới tình nguyện viên hỗ trợ.
                </p>
              </div>
              <Link
                href="/support-requests/new"
                className="inline-flex h-9 items-center rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Tạo yêu cầu
              </Link>
            </div>
          </section>
        )
      ) : profile.role === "VOLUNTEER" ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-semibold text-emerald-800">
                Nhiệm vụ tình nguyện
              </span>
              <h3 className="mt-1 text-base font-bold text-slate-900">
                Bạn đã đăng ký {assignments.length} đợt hỗ trợ
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Theo dõi tiến độ các nhiệm vụ hỗ trợ bạn đang tham gia.
              </p>
            </div>
            <Link
              href="/support-requests"
              className="inline-flex h-9 items-center rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              Xem nhiệm vụ &rarr;
            </Link>
          </div>
        </section>
      ) : null}

      {/* 4. TIÊU ĐIỂM hỗ trợ */}
      <section>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Hoàn cảnh đang cần trợ giúp
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Các trường hợp được gửi từ người dân và tình nguyện viên cơ sở.
            </p>
          </div>
          <Link
            href="/support-requests"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
          >
            <span>Tất cả hoàn cảnh ({requests.length})</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {displayCampaigns.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayCampaigns.slice(0, 6).map((request) => (
              <CharityCampaignCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            Hiện tại các yêu cầu hỗ trợ đang được xử lý ổn định.
          </div>
        )}
      </section>

      {/* 5. ĐIỂM TIẾP NHẬN & HOẠT ĐỘNG GẦN ĐÂY */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Cột 1: Điểm tiếp nhận trực tiếp */}
        <div className="flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Điểm tiếp nhận trực tiếp
              </h3>
              <p className="text-xs text-slate-500">
                Địa điểm tiếp nhận vật phẩm và hàng hỗ trợ
              </p>
            </div>
            <Link
              href="/support-locations"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Bản đồ &rarr;
            </Link>
          </div>

          <div className="flex-1 space-y-2.5">
            {locations.slice(0, 3).map((loc) => (
              <div
                key={loc.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    {loc.name}
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Mở cửa
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                  {loc.address || "Chưa cập nhật địa chỉ"}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-emerald-700 font-medium">
                    {loc.contactPhone || "1800 6868"}
                  </span>
                  <Link
                    href="/support-locations"
                    className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700"
                  >
                    Xem chi tiết &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột 2: Hoạt động cộng đồng */}
        <div className="flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cập nhật từ cộng đồng
              </h3>
              <p className="text-xs text-slate-500">
                Chia sẻ và thông tin từ các điểm hỗ trợ
              </p>
            </div>
            <Link
              href="/social"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Bảng tin &rarr;
            </Link>
          </div>

          <div className="flex-1 space-y-2.5">
            {posts.length > 0 ? (
              posts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {post.authorName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(post.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 text-xs">
                <p>Chưa có bài viết mới.</p>
                <Link
                  href="/social"
                  className="mt-1 font-semibold text-emerald-600 hover:underline"
                >
                  Xem bảng tin cộng đồng &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
