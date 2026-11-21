"use client";

import SplitText from "@/components/SplitText";

export function HeroHeading() {
  return (
    <h1 className="mt-5 text-4xl font-black leading-[1.15] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem] select-none">
      <SplitText
        text="Kết nối"
        tag="span"
        effect="rise"
        hoverEffect="lift"
        delay={35}
        duration={0.7}
        trigger="load"
        className="inline-block cursor-default"
      />{" "}
      <span className="inline-block text-emerald-700">
        <SplitText
          text="người cần hỗ trợ"
          tag="span"
          effect="rise"
          hoverEffect="lift"
          delay={35}
          duration={0.7}
          trigger="load"
          className="inline-block text-emerald-700 cursor-default"
        />
      </span>{" "}
      <SplitText
        text="với"
        tag="span"
        effect="rise"
        hoverEffect="lift"
        delay={35}
        duration={0.7}
        trigger="load"
        className="inline-block cursor-default"
      />{" "}
      <span className="inline-block text-blue-400">
        <SplitText
          text="tình nguyện viên"
          tag="span"
          effect="rise"
          hoverEffect="lift"
          delay={35}
          duration={0.7}
          trigger="load"
          className="inline-block text-blue-400 cursor-default"
        />
      </span>{" "}
      <SplitText
        text="gần nhất"
        tag="span"
        effect="rise"
        hoverEffect="lift"
        delay={35}
        duration={0.7}
        trigger="load"
        className="inline-block cursor-default"
      />
    </h1>
  );
}

