"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  DEMO_ZIP_CONTENTS,
  customerStatus,
  type CustomerPhase,
  type DemoSku,
} from "@/data/manuscriptFlow";
import { updateFlow, useDemoStore } from "@/lib/demoStore";
import {
  Badge,
  Banner,
  Btn,
  CARD,
  Card,
  Thumb,
  nowLabel,
  type Tone,
} from "./polaris";

const PHASES = ["訂單成立", "稿件審核", "付款", "印製", "出貨"] as const;

/** 稿件狀態轉成客戶看得懂的說法 */
function skuCustomerLabel(status: DemoSku["status"]): {
  label: string;
  tone: Tone;
} {
  switch (status) {
    case "未分款":
      return { label: "已收到", tone: "default" };
    case "待檢稿":
      return { label: "審核中", tone: "info" };
    case "待補件":
      return { label: "需補件", tone: "critical" };
    case "補件待檢":
      return { label: "補件審核中", tone: "warning" };
    case "已核准":
      return { label: "已通過", tone: "success" };
  }
}

function PhaseTracker({ phase }: { phase: CustomerPhase }) {
  return (
    <ol className="flex items-start">
      {PHASES.map((label, i) => {
        const done = i < phase;
        const active = i === phase;
        return (
          <li key={label} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold ${
                  done
                    ? "bg-[#303030] text-white"
                    : active
                      ? "border-2 border-[#303030] bg-white text-[#303030]"
                      : "border border-[#c9cccf] bg-white text-[#8a8a8a]"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[12px] ${
                  active
                    ? "font-semibold text-[#303030]"
                    : done
                      ? "text-[#303030]"
                      : "text-[#8a8a8a]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < PHASES.length - 1 ? (
              <span
                className={`mx-1 mt-3 h-0.5 flex-1 ${
                  done ? "bg-[#303030]" : "bg-[#e3e3e3]"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

type PastOrder = {
  no: string;
  date: string;
  items: string;
  total: number;
  status: string;
  tone: Tone;
};

const PAST_ORDERS: PastOrder[] = [
  {
    no: "OY-20261028-014",
    date: "2026-10-28",
    items: "精品名片 × 200",
    total: 1680,
    status: "已出貨",
    tone: "success",
  },
  {
    no: "OY-20260915-006",
    date: "2026-09-15",
    items: "A2 海報 × 40",
    total: 1800,
    status: "已出貨",
    tone: "success",
  },
];

export function MemberPortalDemo() {
  const store = useDemoStore();
  const flow = store.flow;
  const publicEvents = store.events.filter((e) => !e.internal);
  const status = customerStatus(flow);

  const [view, setView] = useState<"orders" | "detail" | "profile">("detail");
  const [toast, setToast] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pulse, setPulse] = useState<{ from: string; to: string } | null>(null);
  const [lastFive, setLastFive] = useState("88321");

  /* ── 接收員工後台的變更：新事件 → 通知；狀態變化 → 頂部提示 ── */
  const prevEventCount = useRef<number | null>(null);
  const prevLabel = useRef<string | null>(null);

  useEffect(() => {
    const count = store.events.length;
    if (prevEventCount.current !== null) {
      if (count > prevEventCount.current) {
        const newest = store.events[0];
        if (newest && !newest.internal) {
          setUnread((n) => n + 1);
          setToast(`訂單更新：${newest.text}`);
          const t = window.setTimeout(() => setToast(""), 4500);
          prevEventCount.current = count;
          return () => window.clearTimeout(t);
        }
      } else if (count < prevEventCount.current) {
        setUnread(0);
        setPulse(null);
      }
    }
    prevEventCount.current = count;
  }, [store.events]);

  useEffect(() => {
    if (prevLabel.current !== null && prevLabel.current !== status.label) {
      setPulse({ from: prevLabel.current, to: status.label });
      const t = window.setTimeout(() => setPulse(null), 9000);
      prevLabel.current = status.label;
      return () => window.clearTimeout(t);
    }
    prevLabel.current = status.label;
  }, [status.label]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  };

  /* ── 會員自己能做的動作（寫回共用狀態，員工後台會即時看到） ── */
  const uploadZip = () =>
    updateFlow(
      (prev) => ({
        ...prev,
        zipName: "三款名片_完稿整包.zip",
        zipUploadedAt: nowLabel(),
        unsortedFiles: [...DEMO_ZIP_CONTENTS],
      }),
      { at: nowLabel(), text: "您上傳了「三款名片_完稿整包.zip」，我們已收到。" },
    );

  const resubmit = (skuId: string) => {
    const sku = flow.skus.find((s) => s.id === skuId);
    if (!sku) return;
    updateFlow(
      (prev) => ({
        ...prev,
        skus: prev.skus.map((s) =>
          s.id === skuId
            ? {
                ...s,
                status: "補件待檢",
                assignedFiles: [...s.assignedFiles, `${s.code}_補件v2.pdf`],
              }
            : s,
        ),
      }),
      { at: nowLabel(), text: `您已補傳 ${sku.code} 的修正稿。` },
    );
  };

  const submitTransfer = () =>
    updateFlow(
      (prev) => ({
        ...prev,
        transfer: {
          lastFive,
          amount: prev.totalAmount,
          paidAt: nowLabel().slice(0, 10),
          submittedAt: nowLabel(),
        },
      }),
      { at: nowLabel(), text: `您回報了轉帳（帳號末五碼 ${lastFive}）。` },
    );

  const fixupSkus = flow.skus.filter((s) => s.status === "待補件");

  return (
    <div className="min-h-dvh bg-[#f6f6f7]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[#e3e3e3] bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <button
            type="button"
            onClick={() => setView("orders")}
            className="flex items-center gap-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e85a12] text-[13px] font-bold text-white">
              橙
            </span>
            <span className="text-[15px] font-bold">橙益印刷</span>
          </button>
          <nav className="flex gap-1 text-[13px]">
            {(
              [
                ["orders", "訂單"],
                ["profile", "個人資料"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`rounded-lg px-3 py-1.5 ${
                  view === id || (id === "orders" && view === "detail")
                    ? "bg-[#f1f1f1] font-semibold"
                    : "text-[#616161] hover:bg-[#f7f7f7]"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                aria-label="通知"
                onClick={() => {
                  setBellOpen((v) => !v);
                  setUnread(0);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
              >
                🔔
                {unread > 0 ? (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e51c00] px-1 text-[10px] font-semibold text-white">
                    {unread}
                  </span>
                ) : null}
              </button>
              {bellOpen ? (
                <div
                  className={`${CARD} absolute right-0 top-11 w-80 overflow-hidden`}
                >
                  <p className="border-b border-[#ebebeb] px-4 py-3 text-[13px] font-semibold">
                    通知
                  </p>
                  <ul className="max-h-72 divide-y divide-[#ebebeb] overflow-y-auto">
                    {publicEvents.slice(0, 8).map((e, i) => (
                      <li key={`${e.at}-${i}`} className="px-4 py-2.5">
                        <p className="text-[13px]">{e.text}</p>
                        <p className="text-[11px] text-[#616161]">{e.at}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#303030] text-[12px] font-semibold text-white">
              林
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Demo hint */}
        <div className="mb-4">
          <Banner tone="info">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Demo：此頁與員工後台共用同一筆訂單。請另開分頁操作員工端，這裡會即時更新。
              </span>
              <Link
                href="/demo/manuscript-flow"
                target="_blank"
                className="font-semibold underline"
              >
                開啟員工後台 ↗
              </Link>
            </span>
          </Banner>
        </div>

        {toast ? (
          <div className="mb-4">
            <Banner tone="success">{toast}</Banner>
          </div>
        ) : null}

        {/* ───────── Orders list ───────── */}
        {view === "orders" && (
          <>
            <h1 className="text-[22px] font-bold">訂單</h1>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setView("detail")}
                className={`${CARD} block w-full p-4 text-left transition hover:shadow-[0_0_0_1px_#303030]`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold">#{flow.orderNo}</p>
                    <Badge tone={status.tone}>{status.label}</Badge>
                    {status.needsAction ? (
                      <Badge tone="attention">需要您處理</Badge>
                    ) : null}
                  </div>
                  <p className="text-[13px] text-[#616161]">
                    {flow.createdAt.slice(0, 10)}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {flow.skus.map((s) => (
                    <Thumb key={s.id} code={s.code} />
                  ))}
                  <p className="ml-2 text-[13px] text-[#616161]">
                    精品名片 A／B／C 各 2 盒
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[13px] text-[#616161]">{status.hint}</p>
                  <p className="text-[14px] font-semibold">
                    NT$ {flow.totalAmount.toLocaleString("zh-TW")}
                  </p>
                </div>
              </button>

              {PAST_ORDERS.map((o) => (
                <button
                  key={o.no}
                  type="button"
                  onClick={() => flash("此為示範用的歷史訂單，僅供展示列表")}
                  className={`${CARD} block w-full p-4 text-left hover:shadow-[0_0_0_1px_#c9cccf]`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold">#{o.no}</p>
                      <Badge tone={o.tone}>{o.status}</Badge>
                    </div>
                    <p className="text-[13px] text-[#616161]">{o.date}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[13px] text-[#616161]">{o.items}</p>
                    <p className="text-[14px] font-semibold">
                      NT$ {o.total.toLocaleString("zh-TW")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ───────── Profile ───────── */}
        {view === "profile" && (
          <>
            <h1 className="text-[22px] font-bold">個人資料</h1>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card title="聯絡資訊">
                <dl className="space-y-2 text-[13px]">
                  <div>
                    <dt className="text-[#616161]">姓名</dt>
                    <dd>{flow.customer}</dd>
                  </div>
                  <div>
                    <dt className="text-[#616161]">公司</dt>
                    <dd>{flow.company}</dd>
                  </div>
                  <div>
                    <dt className="text-[#616161]">Email</dt>
                    <dd>yun.lin@example.com</dd>
                  </div>
                  <div>
                    <dt className="text-[#616161]">電話</dt>
                    <dd>0912-345-678</dd>
                  </div>
                </dl>
              </Card>
              <Card title="預設地址">
                <p className="text-[13px] leading-5">
                  {flow.customer}
                  <br />
                  臺中市南屯區大墩十四街 270 號 5 樓
                  <br />
                  台灣
                </p>
              </Card>
            </div>
          </>
        )}

        {/* ───────── Order detail ───────── */}
        {view === "detail" && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setView("orders")}
                  className="text-[13px] text-[#005bd3] hover:underline"
                >
                  ← 所有訂單
                </button>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-[22px] font-bold">#{flow.orderNo}</h1>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className="mt-1 text-[13px] text-[#616161]">
                  下單於 {flow.createdAt}
                </p>
              </div>
              <Btn onClick={() => flash("已送出客服詢問（示意）")}>
                聯絡客服
              </Btn>
            </div>

            {pulse ? (
              <div className="mt-4">
                <Banner tone="success" title="訂單狀態已更新">
                  {pulse.from} → <strong>{pulse.to}</strong>
                </Banner>
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                {/* Status */}
                <Card title="訂單進度">
                  <PhaseTracker phase={status.phase} />
                  <div className="mt-4 rounded-lg bg-[#f7f7f7] px-3 py-2.5 text-[13px]">
                    <span className="font-semibold">{status.label}</span>
                    <span className="text-[#616161]">｜{status.hint}</span>
                  </div>
                </Card>

                {/* Action: upload */}
                {status.needsAction === "upload" && (
                  <Card
                    title="上傳稿件"
                    badge={<Badge tone="attention">需要您處理</Badge>}
                  >
                    <div className="rounded-xl border border-dashed border-[#8a8a8a] bg-[#fafafa] px-4 py-8 text-center">
                      <p className="text-[13px] font-medium">
                        把三款名片的完稿整包壓成一個 ZIP
                      </p>
                      <p className="mt-1 text-[12px] text-[#616161]">
                        不用先拆款，客服會協助整理分款並逐款檢稿。
                      </p>
                      <div className="mt-4">
                        <Btn variant="primary" onClick={uploadZip}>
                          選擇並上傳 ZIP（模擬）
                        </Btn>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Action: fixup */}
                {status.needsAction === "fixup" && (
                  <Card
                    title="需要補件"
                    badge={<Badge tone="critical">需要您處理</Badge>}
                  >
                    <ul className="space-y-3">
                      {fixupSkus.map((s) => (
                        <li key={s.id}>
                          <Banner tone="critical" title={s.name}>
                            {s.rejectReason}
                          </Banner>
                          <div className="mt-2 flex justify-end">
                            <Btn variant="primary" onClick={() => resubmit(s.id)}>
                              上傳補件（模擬）
                            </Btn>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Action: transfer */}
                {status.needsAction === "transfer" && (
                  <Card
                    title="轉帳付款"
                    badge={<Badge tone="attention">需要您處理</Badge>}
                  >
                    <dl className="grid gap-3 text-[13px] sm:grid-cols-3">
                      <div>
                        <dt className="text-[#616161]">應付金額</dt>
                        <dd className="mt-0.5 text-[16px] font-semibold">
                          NT$ {flow.totalAmount.toLocaleString("zh-TW")}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-[#616161]">匯款帳戶（示意）</dt>
                        <dd className="mt-0.5">台新銀行 000-123456789012</dd>
                      </div>
                    </dl>
                    <form
                      className="mt-4 flex flex-wrap items-end gap-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitTransfer();
                      }}
                    >
                      <label className="text-[13px]">
                        <span className="mb-1 block font-medium">
                          匯款帳號末五碼
                        </span>
                        <input
                          value={lastFive}
                          onChange={(e) => setLastFive(e.target.value)}
                          className="h-9 w-40 rounded-lg border border-[#8a8a8a] px-3 text-[13px] outline-none focus:border-[#005bd3] focus:shadow-[0_0_0_2px_#cfe3ff]"
                        />
                      </label>
                      <Btn type="submit" variant="primary">
                        送出匯款回報
                      </Btn>
                    </form>
                  </Card>
                )}

                {flow.transfer && !flow.paymentVerified ? (
                  <Banner tone="warning" title="款項確認中">
                    已收到您的回報（末五碼 {flow.transfer.lastFive}），客服核對帳務後會更新狀態。
                  </Banner>
                ) : null}

                {/* Artwork */}
                <Card title={`稿件（${flow.skus.length}）`} flush>
                  <ul className="divide-y divide-[#ebebeb]">
                    {flow.skus.map((s) => {
                      const c = skuCustomerLabel(
                        flow.zipName ? s.status : "未分款",
                      );
                      return (
                        <li key={s.id} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <Thumb code={s.code} />
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold">
                                {s.name}
                              </p>
                              <p className="text-[12px] text-[#616161]">
                                {s.quantityLabel}
                              </p>
                              {s.status === "待補件" && s.rejectReason ? (
                                <p className="mt-1.5 text-[12px] text-[#8e0b21]">
                                  退件原因：{s.rejectReason}
                                </p>
                              ) : null}
                              {s.assignedFiles.length > 0 ? (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {s.assignedFiles.map((f) => (
                                    <span
                                      key={f}
                                      className="rounded-md bg-[#f1f1f1] px-1.5 py-0.5 font-mono text-[11px] text-[#616161]"
                                    >
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="text-right">
                              <Badge tone={flow.zipName ? c.tone : "default"}>
                                {flow.zipName ? c.label : "待上傳"}
                              </Badge>
                              <p className="mt-1 text-[13px]">
                                NT$ {s.amount.toLocaleString("zh-TW")}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Card>

                {/* Timeline */}
                <section>
                  <h2 className="mb-2 text-[14px] font-semibold">訂單動態</h2>
                  <div className={`${CARD} p-4`}>
                    <ol className="space-y-4 border-l border-[#e3e3e3] pl-4">
                      {publicEvents.map((e, i) => (
                        <li key={`${e.at}-${i}`} className="relative">
                          <span
                            className={`absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full ${
                              i === 0 ? "bg-[#303030]" : "bg-[#c9cccf]"
                            }`}
                          />
                          <div className="flex items-start justify-between gap-3 text-[13px]">
                            <p className={i === 0 ? "font-semibold" : ""}>
                              {e.text}
                            </p>
                            <p className="shrink-0 text-[12px] text-[#616161]">
                              {e.at}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-4">
                <Card title="訂單摘要">
                  <dl className="space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-[#616161]">小計（3 項）</dt>
                      <dd>NT$ {flow.totalAmount.toLocaleString("zh-TW")}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#616161]">運費</dt>
                      <dd>NT$ 0</dd>
                    </div>
                    <div className="flex justify-between border-t border-[#ebebeb] pt-2 font-semibold">
                      <dt>合計</dt>
                      <dd>NT$ {flow.totalAmount.toLocaleString("zh-TW")}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-[#616161]">付款狀態</dt>
                      <dd>
                        {flow.paymentVerified ? (
                          <Badge tone="success" dot="full">
                            已付款
                          </Badge>
                        ) : flow.transfer ? (
                          <Badge tone="warning" dot="partial">
                            確認中
                          </Badge>
                        ) : flow.paymentNotified ? (
                          <Badge tone="attention" dot="empty">
                            待付款
                          </Badge>
                        ) : (
                          <Badge tone="default" dot="empty">
                            尚未請款
                          </Badge>
                        )}
                      </dd>
                    </div>
                  </dl>
                </Card>

                <Card title="配送資訊">
                  <p className="text-[13px] leading-5">
                    {flow.customer}
                    <br />
                    臺中市南屯區大墩十四街 270 號 5 樓
                    <br />
                    台灣
                  </p>
                  <div className="mt-3 rounded-lg bg-[#f7f7f7] px-3 py-2 text-[12px] text-[#616161]">
                    {flow.shipped
                      ? (flow.shippingNote ?? "已出貨")
                      : flow.printing
                        ? "印製完成後會寄出，屆時這裡會顯示物流單號。"
                        : "付款並完成印製後才會出貨。"}
                  </div>
                </Card>

                <Card title="聯絡資訊">
                  <p className="text-[13px] text-[#005bd3]">
                    yun.lin@example.com
                  </p>
                  <p className="text-[13px] text-[#616161]">0912-345-678</p>
                </Card>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
