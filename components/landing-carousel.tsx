"use client";

import Carousel, { type CarouselItem } from "./Carousel";

const COMMUNITY_ACTIVITIES: CarouselItem[] = [
  {
    id: "back-to-school",
    title: "Tiếp sức đến trường",
    description:
      "Tặng balo, sách vở và góc học tập cho học sinh nghèo vượt khó tại các điểm trường vùng cao.",
    image: "/carousel/back-to-school.jpg",
    alt: "Tiếp sức đến trường cho trẻ em nghèo",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10M6 10h10" />
      </svg>
    ),
  },
  {
    id: "elderly-care",
    title: "Chăm sóc người già neo đơn",
    description:
      "Thăm hỏi tận nhà, chia sẻ yêu thương và hỗ trợ y tế, nhu yếu phẩm định kỳ cho các cụ già neo đơn.",
    image: "/carousel/elderly-care.jpg",
    alt: "Chăm sóc người già neo đơn",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    id: "charity-meals",
    title: "Bữa cơm nhân ái",
    description:
      "Nấu và trao tặng hàng trăm suất ăn nóng hổi, đủ dinh dưỡng cho người lao động nghèo và người khó khăn.",
    image: "/carousel/charity-meals.jpg",
    alt: "Bữa cơm nhân ái",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
      </svg>
    ),
  },
  {
    id: "community-hub",
    title: "Điểm tiếp nhận & quyên góp",
    description:
      "Mạng lưới tiếp nhận quần áo ấm, nhu yếu phẩm và phân loại điều phối minh bạch đến tận tay bà con.",
    image: "/carousel/community-hub.jpg",
    alt: "Điểm tiếp nhận và quyên góp cộng đồng",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

export function LandingCarousel() {
  return (
    <div className="flex flex-col items-center">
      {/* Main Carousel */}
      <div className="w-full max-w-4xl flex justify-center">
        <Carousel
          items={COMMUNITY_ACTIVITIES}
          baseWidth={620}
          aspectRatio={1.5}
          peek={36}
          gap={20}
          radius={20}
          frame={true}
          effect="scale"
          indicator="bars"
          arrows={true}
          autoplay={true}
          autoplayDelay={4200}
          pauseOnHover={true}
          loop={true}
          draggable={true}
          theme="dark"
        />
      </div>
    </div>
  );
}

