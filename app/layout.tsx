import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import ClickSpark from "@/components/ClickSpark";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HelpHub - Nền tảng hỗ trợ & Kết nối Cộng đồng",
  description: "Nền tảng kết nối hỗ trợ khẩn cấp, điều phối nhu yếu phẩm và tình nguyện viên cộng đồng.",
  icons: {
    icon: "/helphub-icon.svg",
    apple: "/helphub-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("h-full antialiased", "font-sans", beVietnamPro.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        <ClickSpark
          sparkColor={["#10b981", "#34d399", "#60a5fa", "#93c5fd", "#f59e0b", "#fbbf24"]}
          sparkCount={9}
          sparkSize={13}
          sparkRadius={32}
          duration={500}
        >
          {children}
        </ClickSpark>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
