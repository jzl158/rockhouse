// src/components/about/AboutIntro.tsx
"use client";

import Image from "next/image";

type AboutIntroProps = {
  imageSrc: string;
  imageAlt?: string;
  heading?: string;
  text?: string;
};

export default function AboutIntro({
  imageSrc,
  imageAlt = "",
  heading = "ABOUT US.",
  text = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
}: AboutIntroProps) {
  return (
    <section className="relative bg-gray-100">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gray-300 justify-center" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* mobile: stacked; desktop: overlap */}
        <div className="flex flex-col md:flex-row md:items-center">
          {/* Image: larger than card, not full-width on mobile */}
          <div className="md:w-2/3">
            <div className="relative mx-auto w-[92%] max-w-[680px] md:w-auto md:max-w-none">
              <div className="relative h-[220px] sm:h-[280px] md:h-[420px] rounded-lg overflow-hidden shadow">
                <Image src={imageSrc} alt={imageAlt} fill priority className="object-cover" />
              </div>
            </div>
          </div>

          {/* Card: mobile sits under image with slight tuck; desktop overlaps left */}
          <div className="relative z-10 -mt-6 mx-auto w-[86%] max-w-[520px] md:mt-40 md:mx-0 md:w-1/3 md:-ml-[5rem]">
            <div className="bg-white rounded-md shadow-lg p-6 md:p-8">
              <h3 className="text-2xl font-semibold tracking-tight text-gray-800">{heading}</h3>
              <div className="mt-3 h-1 w-16 bg-green-500" />
              <p className="mt-5 text-gray-600 leading-relaxed">{text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
