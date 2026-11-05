"use client";

import { useState } from "react";
import type { TransferReport } from "@/data/member";

type Props = {
  orderAmount: number;
  existing?: TransferReport;
  enabled: boolean;
};

export function TransferPanel({ orderAmount, existing, enabled }: Props) {
  const [report, setReport] = useState<TransferReport | undefined>(existing);
  const [lastFive, setLastFive] = useState("");
  const [amount, setAmount] = useState(String(orderAmount));
  const [paidAt, setPaidAt] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{5}$/.test(lastFive)) {
      setMessage("請填寫匯款帳號末五碼（5 位數字）");
      return;
    }
    if (!paidAt) {
      setMessage("請填寫轉帳時間");
      return;
    }

    setReport({
      lastFive,
      amount: Number(amount) || orderAmount,
      paidAt,
      note: note || undefined,
      submittedAt: new Date()
        .toLocaleString("zh-TW", { hour12: false })
        .replace(/\//g, "-"),
    });
    setMessage("已送出轉帳回報（Demo）。員工後台核對後會標記已收款。");
  };

  if (!enabled && !report) {
    return (
      <div className="border border-line bg-white px-5 py-5 text-sm text-mute">
        檢稿通過並標記「確認可印製／待付款」後，可於此回報轉帳資訊。
      </div>
    );
  }

  return (
    <div className="border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-[family-name:var(--font-display-tc)] text-lg">
          轉帳回報
        </h3>
        <p className="mt-1 text-sm text-mute">
          依合約流程：檢稿通過 → 通知轉帳 → 回報末五碼／金額／時間（可附憑證）。
        </p>
      </div>

      {report ? (
        <div className="space-y-2 px-5 py-5 text-sm">
          <p>
            末五碼：<span className="font-medium">{report.lastFive}</span>
          </p>
          <p>
            金額：
            <span className="font-medium">
              NT$ {report.amount.toLocaleString("zh-TW")}
            </span>
          </p>
          <p>
            轉帳時間：<span className="font-medium">{report.paidAt}</span>
          </p>
          {report.note ? <p>備註：{report.note}</p> : null}
          <p className="text-mute">送出時間：{report.submittedAt}</p>
          {message ? <p className="pt-2 text-ink-soft">{message}</p> : null}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <label className="block text-sm">
            匯款末五碼
            <input
              value={lastFive}
              onChange={(e) => setLastFive(e.target.value)}
              maxLength={5}
              className="mt-2 w-full border border-line bg-paper px-3 py-2.5 outline-none focus:border-ink"
              placeholder="12345"
            />
          </label>
          <label className="block text-sm">
            金額
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full border border-line bg-paper px-3 py-2.5 outline-none focus:border-ink"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            轉帳時間
            <input
              type="datetime-local"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="mt-2 w-full border border-line bg-paper px-3 py-2.5 outline-none focus:border-ink"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            備註／憑證說明（Demo）
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 w-full border border-line bg-paper px-3 py-2.5 outline-none focus:border-ink"
              placeholder="可註記已附匯款截圖"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="h-10 bg-brand px-5 text-sm text-white transition-colors hover:bg-brand-deep"
            >
              送出轉帳回報
            </button>
            {message ? <p className="mt-3 text-sm text-ink-soft">{message}</p> : null}
          </div>
        </form>
      )}
    </div>
  );
}
