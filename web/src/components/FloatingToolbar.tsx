"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const items = [
  {
    id: "line",
    label: "LINE",
    href: "https://line.me/",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="currentColor"
          d="M19.5 4.5H4.5A2.5 2.5 0 0 0 2 7v8.2a2.5 2.5 0 0 0 2.5 2.5h3.1l2.6 2.7a.8.8 0 0 0 1.3-.5v-2.2h8a2.5 2.5 0 0 0 2.5-2.5V7a2.5 2.5 0 0 0-2.5-2.5Zm-10 8.1H7.3v-4h2.2v4Zm3.4 0h-2.1v-4h2.1v4Zm3.5 0h-2.2l1.8-4h2.3l-1.9 4Z"
        />
      </svg>
    ),
  },
  {
    id: "member",
    label: "會員",
    href: "/member",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M5.5 18.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "fav",
    label: "收藏",
    href: "/favorites",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M12 19.2 5.8 13a4.1 4.1 0 0 1 5.8-5.8L12 7.3l.4-.4A4.1 4.1 0 0 1 18.2 13L12 19.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "cart",
    label: "購物車",
    href: "/cart",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M4 6h2.2l1.4 9.2h9.8L19.5 8H8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="18.5" r="1.2" fill="currentColor" />
        <circle cx="16.5" cy="18.5" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
] as const;

export function FloatingToolbar() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-3 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2 md:right-5">
      {items.map((item, index) => {
        const className =
          "toolbar-item animate-float-in flex h-11 w-11 flex-col items-center justify-center gap-0.5 border border-line bg-paper/95 text-[0.58rem] tracking-wide text-ink shadow-[0_8px_24px_rgba(20,18,16,0.08)] backdrop-blur transition-colors";
        const style = { animationDelay: `${0.08 * index}s` };

        if ("external" in item && item.external) {
          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              style={style}
              aria-label={item.label}
              title={item.label}
            >
              {item.icon}
              <span className="leading-none">{item.label}</span>
            </a>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={className}
            style={style}
            aria-label={item.label}
            title={item.label}
          >
            {item.icon}
            <span className="leading-none">{item.label}</span>
          </Link>
        );
      })}

      {showTop ? (
        <button
          type="button"
          className="toolbar-item animate-float-in flex h-11 w-11 flex-col items-center justify-center border border-line bg-paper/95 text-[0.58rem] tracking-wide text-ink shadow-[0_8px_24px_rgba(20,18,16,0.08)] backdrop-blur transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="回到頂端"
          title="回到頂端"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M6 14l6-6 6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="leading-none">頂端</span>
        </button>
      ) : null}
    </div>
  );
}
