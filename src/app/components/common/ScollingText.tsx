// components/ScrollingText.tsx
"use client"
// components/ScrollingText.tsx
import React from "react";

type ScrollingTextProps = {
  items: string[];
  separator?: string;
  speedSeconds?: number;
  pauseOnHover?: boolean;
  className?: string;
};

export default function ScrollingText({
  items,
  separator = "•",
  speedSeconds = 20,
  pauseOnHover = true,
  className = "",
}: ScrollingTextProps) {
  const renderList = (keyPrefix: string) => (
    <ul className="flex shrink-0 items-center whitespace-nowrap">
      {items.map((area, i) => (
        <li key={`${keyPrefix}-${i}`} className="flex items-center">
          {i !== 0 && <span className="mx-3">{separator}</span>}
          <span>{area}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex w-[200%] will-change-transform ${
          pauseOnHover ? "hover:[animation-play-state:paused]" : ""
        } animate-marquee`}
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        {renderList("a")}
        {renderList("b")}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
