import Link from "next/link";
import { services } from "@/data/home";

export function ServicesSection() {
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.28em] text-brand uppercase">
              Services
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display-tc)] text-3xl font-semibold tracking-tight md:text-4xl">
              服務入口
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/65">
            印刷下單與設計洽詢分流；包裝盒 3D 另開詢價流程。詳細商品列表下一階段補上。
          </p>
        </div>

        <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-3">
          {services.map((service, index) => (
            <Link
              key={service.id}
              href={service.href}
              className="group relative bg-ink p-8 transition-colors hover:bg-[#1f1b18] md:min-h-[280px] md:p-10"
            >
              <span className="text-xs tracking-[0.28em] text-white/35">
                0{index + 1}
              </span>
              <h3 className="mt-8 font-[family-name:var(--font-display-tc)] text-2xl tracking-tight transition-colors group-hover:text-brand md:text-[1.75rem]">
                {service.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {service.text}
              </p>
              <span className="mt-10 inline-flex items-center gap-2 text-sm text-white/80 transition-all group-hover:gap-3 group-hover:text-brand">
                進入
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
