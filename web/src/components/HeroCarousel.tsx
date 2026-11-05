"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { heroSlides } from "@/data/home";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, []);

  const slide = heroSlides[index];

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-ink text-paper">
      {heroSlides.map((item, i) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20">
        <p className="animate-hero-rise mb-4 text-xs tracking-[0.35em] text-brand uppercase">
          CHENG YI PRINTING
        </p>
        <h1
          key={`title-${slide.id}`}
          className="animate-hero-rise max-w-3xl font-[family-name:var(--font-display-tc)] text-[2.55rem] leading-[1.12] font-semibold tracking-tight md:text-6xl lg:text-[4.25rem]"
        >
          {slide.title}
        </h1>
        <p
          key={`sub-${slide.id}`}
          className="animate-hero-rise-delay mt-5 max-w-xl text-base leading-relaxed text-white/82 md:text-lg"
        >
          {slide.subtitle}
        </p>
        <div className="animate-hero-rise-delay-2 mt-9 flex flex-wrap items-center gap-4">
          <Link
            href={slide.href}
            className="inline-flex h-12 items-center bg-brand px-7 text-sm font-medium tracking-wide text-white transition-colors hover:bg-brand-deep"
          >
            {slide.cta}
          </Link>
          <Link
            href="/about/intro"
            className="inline-flex h-12 items-center border border-white/35 px-7 text-sm tracking-wide text-white/90 transition-colors hover:border-white hover:bg-white/10"
          >
            關於橙益
          </Link>
        </div>

        <div className="mt-14 flex items-center gap-2">
          {heroSlides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`切換至第 ${i + 1} 張輪播`}
              className="carousel-dot h-1.5 w-1.5 rounded-full bg-white/40 transition-all"
              data-active={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
