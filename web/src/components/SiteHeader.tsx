"use client";

import Link from "next/link";
import { useState } from "react";
import { navItems } from "@/data/home";

export function SiteHeader() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 md:h-[4.5rem] md:px-8">
        <Link href="/" className="group flex shrink-0 items-baseline gap-1.5">
          <span className="font-[family-name:var(--font-display-tc)] text-2xl font-semibold tracking-tight text-ink md:text-[1.7rem]">
            橙益
          </span>
          <span className="text-sm font-medium tracking-[0.18em] text-brand">
            印刷
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.92rem] text-ink-soft transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          className="ml-auto hidden min-w-[12rem] max-w-[16rem] flex-1 items-center border-b border-ink/20 pb-1 md:flex"
          onSubmit={(e) => {
            e.preventDefault();
          }}
          role="search"
        >
          <label htmlFor="site-search" className="sr-only">
            搜尋商品
          </label>
          <input
            id="site-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋商品"
            className="w-full bg-transparent text-sm outline-none placeholder:text-mute"
          />
          <button
            type="submit"
            className="pl-2 text-xs tracking-wider text-mute transition-colors hover:text-brand"
          >
            搜尋
          </button>
        </form>

        <button
          type="button"
          className="ml-auto flex h-10 w-10 items-center justify-center border border-line lg:hidden"
          aria-label={open ? "關閉選單" : "開啟選單"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 block h-px w-full bg-ink transition-all ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-px w-full bg-ink transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-full bg-ink transition-all ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-paper px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1 text-base text-ink-soft"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form
            className="mt-4 flex items-center border-b border-ink/20 pb-1"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋商品"
              className="w-full bg-transparent text-sm outline-none placeholder:text-mute"
            />
          </form>
        </div>
      ) : null}
    </header>
  );
}
