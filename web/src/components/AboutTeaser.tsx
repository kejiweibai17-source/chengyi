import Image from "next/image";
import Link from "next/link";
import { aboutPoints } from "@/data/home";

export function AboutTeaser() {
  return (
    <section className="bg-paper-deep">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:gap-14 md:px-8 md:py-24">
        <div className="relative min-h-[320px] overflow-hidden md:min-h-[460px]">
          <Image
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"
            alt="印刷紙材與色票細節"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <p className="text-xs tracking-[0.28em] text-white/70 uppercase">
              Taichung · Nantun
            </p>
            <p className="mt-2 font-[family-name:var(--font-display-tc)] text-2xl">
              橙益印刷事業
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs tracking-[0.28em] text-brand uppercase">About</p>
          <h2 className="mt-3 font-[family-name:var(--font-display-tc)] text-3xl font-semibold tracking-tight md:text-4xl">
            關於橙益
          </h2>
          <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
            我們把印刷當作交付系統來做：規格清楚、檔案可追、檢稿有紀錄。
            這一區是首頁摘要；完整內容會落在三個獨立頁面。
          </p>

          <div className="mt-8 space-y-0 border-t border-line">
            {aboutPoints.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start justify-between gap-6 border-b border-line py-5"
              >
                <div>
                  <p className="text-lg font-medium tracking-tight transition-colors group-hover:text-brand">
                    {item.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">
                    {item.text}
                  </p>
                </div>
                <span className="mt-1 text-mute transition-transform group-hover:translate-x-1 group-hover:text-brand">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
