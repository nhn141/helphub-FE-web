import Link from "next/link";
import Image from "next/image";
import { HeroCTA } from "@/components/hero-cta";
import { HeroHeading } from "@/components/hero-heading";
import { HelpHubLogo } from "@/components/helphub-logo";

export const metadata = {
  title: "HelpHub – Kết nối hỗ trợ cộng đồng",
  description:
    "Mạng xã hội kết nối người cần hỗ trợ với tình nguyện viên trên toàn quốc. Gửi yêu cầu, nhận giúp đỡ, lan toả yêu thương.",
};

const stats = [
  { label: "Tình nguyện viên", value: "1.200+" },
  { label: "Yêu cầu hỗ trợ", value: "340+" },
  { label: "Điểm tiếp nhận", value: "80+" },
  { label: "Tỉnh thành", value: "24" },
];

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Gửi yêu cầu dễ dàng",
    description: "Mô tả tình huống, chọn loại hỗ trợ cần thiết và gửi yêu cầu chỉ trong vài bước. Cộng đồng sẽ tiếp nhận ngay.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Mạng lưới tình nguyện viên",
    description: "Hàng nghìn tình nguyện viên sẵn sàng hỗ trợ trên khắp cả nước, được phân phối theo khu vực để phản hồi nhanh nhất.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Điểm tiếp nhận gần bạn",
    description: "Xem bản đồ các điểm tiếp nhận hàng hỗ trợ, tìm nơi giao nhận thuận tiện nhất theo vị trí của bạn.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Nhắn tin trực tiếp",
    description: "Liên lạc trực tiếp giữa người cần hỗ trợ và tình nguyện viên qua hệ thống chat nội bộ bảo mật.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Theo dõi tiến độ",
    description: "Cập nhật trạng thái yêu cầu theo thời gian thực — từ lúc gửi, tiếp nhận cho đến khi hoàn thành.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "An toàn và minh bạch",
    description: "Mọi yêu cầu và tình nguyện viên đều được xác thực bởi ban quản trị, đảm bảo môi trường an toàn và tin cậy.",
  },
];

const steps = [
  { step: "01", title: "Đăng ký tài khoản", desc: "Chọn vai trò của bạn — người cần hỗ trợ hoặc tình nguyện viên." },
  { step: "02", title: "Đăng hoặc nhận yêu cầu", desc: "Gửi yêu cầu hỗ trợ hoặc xem danh sách các yêu cầu cần giúp đỡ gần bạn." },
  { step: "03", title: "Kết nối & hành động", desc: "Liên lạc trực tiếp, thống nhất phương án và cùng nhau tạo ra sự thay đổi." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-950">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white p-1 shadow-[0_2px_0_0_#cbd5e1] border-2 border-slate-200">
              <HelpHubLogo className="size-full" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">HelpHub</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Đăng nhập
            </Link>
            <Link
              href="/login?mode=register"
              className="inline-flex h-9 items-center rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white shadow-[0_3px_0_0_#065f46] transition hover:bg-emerald-800 active:translate-y-px active:shadow-none"
            >
              Tham gia ngay
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-[#f0faf4] py-16 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left — text */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mạng xã hội hỗ trợ cộng đồng
              </span>
              <HeroHeading />
              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                <span className="font-semibold text-slate-800">HelpHub</span> là nền tảng mạng xã hội hỗ trợ cộng đồng,
                được xây dựng như một cầu nối để các hoàn cảnh khó khăn và mạng lưới tình nguyện viên trên khắp mọi miền đất nước tìm thấy nhau.
              </p>
              <p className="mt-3 text-sm text-slate-500">
                📍 Bạn đang cần hỗ trợ? Hay muốn trở thành tình nguyện viên ngay hôm nay?
              </p>
              <HeroCTA />
            </div>

            {/* Right — hero image */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 shadow-xl">
                <Image
                  src="/helphub-auth-hero.png"
                  alt="Tình nguyện viên phân phối hàng hỗ trợ"
                  width={640}
                  height={420}
                  className="w-full object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -left-4 flex items-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 shadow-lg">
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100">
                  <svg viewBox="0 0 24 24" className="size-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">340+ yêu cầu</p>
                  <p className="text-[11px] text-slate-500">đã được tiếp nhận</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-14 grid grid-cols-2 gap-4 border-t border-slate-200 pt-10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-emerald-700">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Tất cả những gì bạn cần
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Từ gửi yêu cầu đến kết nối tình nguyện
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border-2 border-slate-200 bg-white p-6 transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl border-2 border-emerald-100 bg-emerald-50 text-emerald-700 shadow-[0_2px_0_0_#a7f3d0] transition group-hover:bg-emerald-100">
                  {f.icon}
                </div>
                <h3 className="text-base font-black text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-slate-100 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Chỉ 3 bước để bắt đầu hành trình kết nối.
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Hãy bắt đầu ngay hôm nay
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+2.5rem)] top-6 hidden h-0.5 w-[calc(100%-5rem)] bg-emerald-200 sm:block" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-white text-lg font-black text-emerald-700 shadow-[0_3px_0_0_#a7f3d0]">
                    {s.step}
                  </div>
                  <h3 className="mt-4 text-base font-black text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-emerald-700 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            HelpHub đang chờ bạn
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login?mode=register"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-emerald-800 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition hover:bg-emerald-50 active:translate-y-0.5 active:shadow-none"
            >
              Đăng ký miễn phí
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-white/40 px-7 text-sm font-bold text-white transition hover:border-white/70 hover:bg-white/10"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-white p-0.5 shadow-xs border border-slate-200">
                <HelpHubLogo className="size-full" />
              </div>
              <span className="text-sm font-black">HelpHub</span>
              <span className="text-sm text-slate-400">— Vì một cộng đồng không ai bị bỏ lại phía sau</span>
            </div>
            <p className="text-xs text-slate-400">© 2026 HelpHub. Dự án cộng đồng phi lợi nhuận.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
