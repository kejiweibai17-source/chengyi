import Link from "next/link";
import { footerColumns } from "@/data/home";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.2fr_2fr] md:px-8 md:py-16">
        <div>
          <Link href="/" className="inline-flex items-baseline gap-1.5">
            <span className="font-[family-name:var(--font-display-tc)] text-2xl font-semibold">
              橙益
            </span>
            <span className="text-sm font-medium tracking-[0.18em] text-brand">
              印刷
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mute">
            台中南屯 · 印刷／包裝設計／視覺傳達。本頁為客戶預覽用 Demo，內容可於後台維護。
          </p>
          <p className="mt-6 text-xs tracking-wide text-mute">
            臺中市南屯區大墩十四街 270 號 5 樓
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-xs tracking-[0.2em] text-mute uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-mute md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 橙益印刷事業有限公司</p>
          <p>Demo · 前台首頁預覽</p>
        </div>
      </div>
    </footer>
  );
}
