// src/components/homepage/HeroVideo.tsx
"use client";

import Link from "next/link";
import React from "react";

type HeroVideoProps = {
  videoSrc: string;
  title: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function HeroVideo({
  videoSrc,
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: HeroVideoProps) {
  return (
    <section className="relative isolate min-h-[60vh] w-full overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover -z-10"
        onError={(e) => console.error("Video error:", e)}
        onLoadStart={() => console.log("Video loading started")}
        onCanPlay={() => console.log("Video can play")}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-black/70 -z-10" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl text-white drop-shadow">
          {title}
        </h1>

        {subtitle ? (
          <p className="mx-auto mb-8 max-w-3xl text-white/90 text-lg leading-relaxed">
            {subtitle}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-4">
          {primaryHref && primaryLabel ? (
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 font-medium text-black transition-colors hover:bg-white/90"
            >
              {primaryLabel}
            </Link>
          ) : null}

          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center gap-2 rounded-md border border-white/80 px-5 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
