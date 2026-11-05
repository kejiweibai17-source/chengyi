import Link from "next/link";
import { newsItems } from "@/data/home";

export function NewsSection() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[220px_1fr] md:px-8 md:py-20">
        <div>
          <p className="text-xs tracking-[0.28em] text-brand uppercase">News</p>
          <h2 className="mt-3 font-[family-name:var(--font-display-tc)] text-3xl font-semibold tracking-tight md:text-4xl">
            最新消息
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            服務更新與作品動態，先放示意內容供客戶預覽版型。
          </p>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {newsItems.map((item) => (
            <li key={item.id}>
              <Link
                href="/news"
                className="news-row group flex flex-col gap-2 py-5 transition-colors sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span className="shrink-0 text-xs tracking-wider text-mute tabular-nums">
                  {item.date}
                </span>
                <span className="shrink-0 text-xs tracking-wider text-brand">
                  {item.tag}
                </span>
                <span className="flex-1 text-base text-ink-soft transition-colors group-hover:text-ink md:text-[1.05rem]">
                  {item.title}
                </span>
                <span className="news-arrow text-mute transition-all">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
