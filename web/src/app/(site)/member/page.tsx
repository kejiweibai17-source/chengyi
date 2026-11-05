import Link from "next/link";
import { StatusBadge } from "@/components/member/StatusBadge";
import { demoMember, memberOrders, statusHint } from "@/data/member";

export const metadata = {
  title: "會員中心｜橙益印刷",
  description: "查看訂單、檢稿進度、上傳補件與轉帳回報",
};

export default function MemberPage() {
  const activeCount = memberOrders.filter(
    (order) => order.status !== "已出貨",
  ).length;

  return (
    <div className="bg-paper">
      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8 md:py-16">
          <div>
            <p className="text-xs tracking-[0.28em] text-brand uppercase">
              Member
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display-tc)] text-3xl font-semibold tracking-tight md:text-5xl">
              會員中心
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
              依規劃：可查看自己的訂單規格、金額、上傳紀錄與處理進度；並進行上傳補件與轉帳回報。
            </p>
          </div>
          <div className="border border-white/15 bg-white/5 px-5 py-4 text-sm">
            <p className="text-white/55">Demo 登入身分</p>
            <p className="mt-1 text-lg font-medium">{demoMember.name}</p>
            <p className="text-white/70">{demoMember.email}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-line bg-white px-5 py-5">
            <p className="text-xs tracking-wider text-mute">進行中訂單</p>
            <p className="mt-2 font-[family-name:var(--font-display-tc)] text-3xl">
              {activeCount}
            </p>
          </div>
          <div className="border border-line bg-white px-5 py-5">
            <p className="text-xs tracking-wider text-mute">全部訂單</p>
            <p className="mt-2 font-[family-name:var(--font-display-tc)] text-3xl">
              {memberOrders.length}
            </p>
          </div>
          <div className="border border-line bg-white px-5 py-5">
            <p className="text-xs tracking-wider text-mute">會員資料</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {demoMember.company}
              <br />
              {demoMember.phone}
            </p>
          </div>
        </div>

        <div className="mt-10 border border-brand/25 bg-brand/5 px-5 py-4 text-sm text-ink-soft md:flex md:items-center md:justify-between md:gap-6">
          <p>
            <span className="font-medium text-brand-deep">流程示範：</span>
            三款名片整包 ZIP → 員工分款／檢稿 → 付款發印（假資料可操作）
          </p>
          <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
            <Link
              href="/demo/member"
              className="inline-flex border border-brand bg-brand px-4 py-2 text-sm text-white hover:bg-brand-deep"
            >
              會員前台示範 →
            </Link>
            <Link
              href="/demo/manuscript-flow"
              className="inline-flex border border-brand px-4 py-2 text-sm text-brand-deep hover:bg-brand/10"
            >
              員工後台示範 →
            </Link>
          </div>
        </div>

        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.28em] text-brand uppercase">
              Orders
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display-tc)] text-2xl md:text-3xl">
              我的訂單
            </h2>
          </div>
          <p className="hidden text-sm text-mute md:block">
            狀態：待上傳 → 待檢稿 → 待補件 → 確認可印製 → 待付款 → 已收款 → 印製中 → 已出貨
          </p>
        </div>

        <div className="mt-6 divide-y divide-line border border-line bg-white">
          {memberOrders.map((order) => (
            <Link
              key={order.id}
              href={`/member/orders/${order.id}`}
              className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-paper-deep/50 md:flex-row md:items-center md:justify-between md:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-sm tracking-wide">{order.orderNo}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-2 truncate text-base text-ink">
                  {order.items.map((item) => item.productName).join("、")}
                </p>
                <p className="mt-1 text-sm text-mute">{statusHint(order.status)}</p>
              </div>
              <div className="flex items-center justify-between gap-6 md:flex-col md:items-end">
                <p className="text-sm text-mute">更新 {order.updatedAt}</p>
                <p className="text-base font-medium">
                  NT$ {order.totalAmount.toLocaleString("zh-TW")}
                </p>
                <span className="text-sm text-mute transition-all group-hover:translate-x-1 group-hover:text-brand">
                  查看明細 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
