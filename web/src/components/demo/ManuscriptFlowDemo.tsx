"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEMO_ZIP_CONTENTS,
  FLOW_STEPS,
  allSkusApproved,
  anySkuNeedsFixup,
  createInitialFlowState,
  deriveStepIndex,
  type DemoFlowState,
  type DemoSku,
  type FlowStepId,
} from "@/data/manuscriptFlow";
import {
  pushEvent,
  resetDemoStore,
  updateFlow,
  useDemoStore,
} from "@/lib/demoStore";
import {
  Badge,
  Banner,
  Btn,
  CARD,
  Card,
  Thumb,
  nowLabel,
  skuTone,
} from "./polaris";

/* ───────────── Main ───────────── */

export function ManuscriptFlowDemo() {
  const [step, setStep] = useState<FlowStepId>("order");
  // 共用狀態：員工後台與會員前台讀寫同一份（localStorage + 跨分頁同步）
  const store = useDemoStore();
  const state = store.flow;
  const events = store.events;
  const setState = (
    u: DemoFlowState | ((p: DemoFlowState) => DemoFlowState),
  ) => updateFlow((prev) => (typeof u === "function" ? u(prev) : u));
  const [toast, setToast] = useState("");
  const [unlocked, setUnlocked] = useState<Set<FlowStepId>>(
    () => new Set(["order"]),
  );
  const [navOpen, setNavOpen] = useState(false);
  const [view, setView] = useState<"list" | "detail">("detail");
  const [search, setSearch] = useState("");
  const [listTab, setListTab] = useState<"all" | "unfulfilled" | "unpaid">(
    "all",
  );
  const [notes, setNotes] = useState(() => createInitialFlowState().zipNote);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [tags, setTags] = useState(["名片", "ZIP 整包", "人工檢稿", "轉帳"]);
  const [editingTags, setEditingTags] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);

  /** internal=true 的紀錄只有員工看得到，不會出現在會員前台 */
  const log = (text: string, internal = false) =>
    pushEvent({ at: nowLabel(), text, internal });

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagDraft("");
    log(`員工新增標籤「${t}」。`, true);
  };

  const postComment = () => {
    const t = commentDraft.trim();
    if (!t) return;
    log(`員工備註：${t}`, true);
    setCommentDraft("");
  };

  const saveNote = () => {
    setNotes(noteDraft.trim());
    setEditingNote(false);
    log("員工更新訂單備註。", true);
  };

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  };

  const go = (id: FlowStepId) => {
    setUnlocked((prev) => new Set(prev).add(id));
    setStep(id);
  };

  // 會員在前台做了動作（上傳 ZIP、補件、轉帳回報…）時，自動解鎖對應步驟
  const derivedIndex = deriveStepIndex(state);
  useEffect(() => {
    setUnlocked((prev) => {
      const next = new Set(prev);
      FLOW_STEPS.forEach((s, i) => {
        if (i <= derivedIndex) next.add(s.id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [derivedIndex]);

  const reset = () => {
    resetDemoStore();
    setStep("order");
    setUnlocked(new Set(["order"]));
    setNotes(createInitialFlowState().zipNote);
    setTags(["名片", "ZIP 整包", "人工檢稿", "轉帳"]);
    setEditingNote(false);
    setEditingTags(false);
    setCustomerOpen(false);
    setCommentDraft("");
    flash("已重設為初始假資料");
  };

  const sortedCount = state.skus.filter((s) => s.assignedFiles.length > 0)
    .length;

  const setSku = (id: string, patch: Partial<DemoSku>, historyText?: string) =>
    setState((prev) => ({
      ...prev,
      skus: prev.skus.map((s) =>
        s.id === id
          ? {
              ...s,
              ...patch,
              history: historyText
                ? [{ at: nowLabel(), text: historyText }, ...s.history]
                : s.history,
            }
          : s,
      ),
    }));

  const assignFile = (skuId: string, file: string) => {
    setState((prev) => ({
      ...prev,
      unsortedFiles: prev.unsortedFiles.filter((f) => f !== file),
      skus: prev.skus.map((s) => {
        if (s.id !== skuId)
          return {
            ...s,
            assignedFiles: s.assignedFiles.filter((f) => f !== file),
          };
        if (s.assignedFiles.includes(file)) return s;
        return {
          ...s,
          assignedFiles: [...s.assignedFiles, file],
          status: s.status === "未分款" ? "待檢稿" : s.status,
        };
      }),
    }));
    const sku = state.skus.find((s) => s.id === skuId);
    log(`員工將「${file}」分入 ${sku?.code ?? skuId}。`);
  };

  const autoSort = () => {
    const map: Record<string, string[]> = {
      "sku-a": ["名片A_正面.pdf", "名片A_背面.pdf"],
      "sku-b": ["名片B_完稿.ai"],
      "sku-c": ["名片C_雙面.pdf", "名片C_備註.txt"],
    };
    const used = new Set(Object.values(map).flat());
    setState((prev) => ({
      ...prev,
      unsortedFiles: DEMO_ZIP_CONTENTS.filter((f) => !used.has(f)),
      skus: prev.skus.map((s) => ({
        ...s,
        assignedFiles: map[s.id] ?? [],
        status: "待檢稿",
        rejectReason: undefined,
      })),
    }));
    log("員工完成分款（一鍵模擬），多餘檔案留在未分類。");
    flash("已模擬人工分款完成");
    go("review");
  };

  /* header badges */
  const payBadge = state.paymentVerified ? (
    <Badge tone="success" dot="full">
      已付款
    </Badge>
  ) : state.transfer ? (
    <Badge tone="warning" dot="partial">
      待核帳
    </Badge>
  ) : state.paymentNotified ? (
    <Badge tone="attention" dot="empty">
      待付款
    </Badge>
  ) : (
    <Badge tone="default" dot="empty">
      尚未請款
    </Badge>
  );
  const fulfillBadge = state.shipped ? (
    <Badge tone="success" dot="full">
      已出貨
    </Badge>
  ) : state.printing ? (
    <Badge tone="info" dot="partial">
      印製中
    </Badge>
  ) : (
    <Badge tone="attention" dot="empty">
      未發印
    </Badge>
  );
  const artworkBadge = allSkusApproved(state.skus) ? (
    <Badge tone="success">稿件全部合格</Badge>
  ) : anySkuNeedsFixup(state.skus) ? (
    <Badge tone="critical">待補件</Badge>
  ) : state.zipName ? (
    <Badge tone="info">稿件檢查中</Badge>
  ) : (
    <Badge tone="default">待上傳稿件</Badge>
  );

  const currentIndex = Math.max(
    ...FLOW_STEPS.map((s, i) => (unlocked.has(s.id) ? i : 0)),
  );
  const activeIndex = FLOW_STEPS.findIndex((s) => s.id === step);

  /* ─────────── step panels ─────────── */

  const stepPanel = (() => {
    switch (step) {
      case "order":
        return (
          <Card
            title="確認訂單"
            badge={<Badge tone="info">客戶</Badge>}
            actions={
              <Btn
                variant="primary"
                onClick={() => {
                  log("客戶確認下單，前往上傳稿件。");
                  go("upload");
                  flash("訂單已建立（假資料）");
                }}
              >
                確認下單並上傳稿件
              </Btn>
            }
          >
            <p className="text-[13px] leading-5 text-[#616161]">
              客戶一次訂購三款名片、各兩盒。檔案不必先拆好，可整包壓成一個 ZIP
              上傳；後續由員工人工整理分款、逐款檢稿。
            </p>
          </Card>
        );

      case "upload":
        return (
          <Card
            title="上傳稿件"
            badge={<Badge tone="info">客戶</Badge>}
            actions={
              state.zipName ? (
                <Btn
                  variant="primary"
                  onClick={() => {
                    go("sort");
                    flash("切換至員工視角");
                  }}
                >
                  以員工身分處理
                </Btn>
              ) : null
            }
          >
            {!state.zipName ? (
              <div className="rounded-xl border border-dashed border-[#8a8a8a] bg-[#fafafa] px-4 py-8 text-center">
                <p className="text-[13px] font-medium">整包上傳 ZIP</p>
                <p className="mt-1 text-[12px] text-[#616161]">
                  系統只負責「收到檔案」，不自動解壓、不自動對應品項。
                </p>
                <div className="mt-4">
                  <Btn
                    variant="primary"
                    onClick={() => {
                      setState((prev) => ({
                        ...prev,
                        zipName: "三款名片_完稿整包.zip",
                        zipUploadedAt: nowLabel(),
                        unsortedFiles: [...DEMO_ZIP_CONTENTS],
                      }));
                      log("客戶上傳「三款名片_完稿整包.zip」。");
                      flash("已模擬上傳 ZIP（未真正上傳／解壓）");
                    }}
                  >
                    模擬上傳 三款名片_完稿整包.zip
                  </Btn>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-[#e3e3e3] px-3 py-2.5">
                  <div>
                    <p className="text-[13px] font-medium">{state.zipName}</p>
                    <p className="text-[12px] text-[#616161]">
                      上傳於 {state.zipUploadedAt}
                    </p>
                  </div>
                  <Badge tone="info">待檢稿</Badge>
                </div>
                <Banner>
                  上傳成功僅代表已收到，需待員工分款與人工檢稿。
                </Banner>
              </div>
            )}
          </Card>
        );

      case "sort":
        return (
          <Card
            title="人工整理分款"
            badge={<Badge tone="warning">員工</Badge>}
            actions={
              <div className="flex gap-2">
                <Btn variant="secondary" onClick={autoSort}>
                  一鍵模擬分款
                </Btn>
                <Btn
                  variant="primary"
                  disabled={sortedCount < 3}
                  onClick={() => {
                    go("review");
                    flash("進入逐款檢稿");
                  }}
                >
                  完成分款
                </Btn>
              </div>
            }
          >
            <p className="mb-3 text-[13px] text-[#616161]">
              員工檢視 ZIP 內容後，把檔案歸到對應品項（此 Demo 不實作解壓）。
            </p>
            <div className="overflow-hidden rounded-lg border border-[#e3e3e3]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f7f7f7] text-[12px] font-medium text-[#616161]">
                  <tr>
                    <th className="px-3 py-2">ZIP 內檔案</th>
                    <th className="px-3 py-2">分到品項</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebebeb]">
                  {(state.zipName ? state.unsortedFiles : []).map((f) => (
                    <tr key={f}>
                      <td className="px-3 py-2 font-mono text-[12px]">{f}</td>
                      <td className="px-3 py-2">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            assignFile(e.target.value, f);
                            e.target.value = "";
                          }}
                          className="h-8 rounded-lg border border-[#8a8a8a] bg-white px-2 text-[13px]"
                        >
                          <option value="">選擇品項…</option>
                          {state.skus.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.code}｜{s.name.split("｜")[1]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {(!state.zipName || state.unsortedFiles.length === 0) && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-4 text-center text-[#616161]"
                      >
                        {state.zipName
                          ? "沒有未分類檔案"
                          : "尚未收到 ZIP，請先完成上傳"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case "review":
        return (
          <Card
            title="逐款檢稿"
            badge={<Badge tone="warning">員工</Badge>}
            actions={
              allSkusApproved(state.skus) ? (
                <Btn
                  variant="primary"
                  onClick={() => {
                    log("三款稿件全部合格。");
                    go("pay-notify");
                  }}
                >
                  全部合格，通知付款
                </Btn>
              ) : anySkuNeedsFixup(state.skus) ? (
                <Btn
                  variant="primary"
                  onClick={() => {
                    log("通知客戶補件。");
                    go("fixup");
                  }}
                >
                  通知客戶補件
                </Btn>
              ) : null
            }
          >
            <p className="mb-3 text-[13px] text-[#616161]">
              每一款獨立檢稿；全部核准後才進入付款，任一款退件則停在「待補件」。
            </p>
            <ul className="divide-y divide-[#ebebeb] rounded-lg border border-[#e3e3e3]">
              {state.skus.map((sku) => {
                const reviewable =
                  sku.status === "待檢稿" || sku.status === "補件待檢";
                return (
                  <li key={sku.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <Thumb code={sku.code} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-semibold">
                            {sku.name}
                          </p>
                          <Badge tone={skuTone(sku.status)}>{sku.status}</Badge>
                        </div>
                        <p className="mt-0.5 text-[12px] text-[#616161]">
                          {sku.assignedFiles.join("、") || "尚未分入檔案"}
                        </p>
                        {sku.rejectReason ? (
                          <div className="mt-2">
                            <Banner tone="critical">{sku.rejectReason}</Banner>
                          </div>
                        ) : null}
                      </div>
                      {reviewable ? (
                        <div className="flex shrink-0 gap-2">
                          <Btn
                            variant="critical"
                            onClick={() => {
                              const reason =
                                sku.id === "sku-b"
                                  ? "文字距裁切線不足 3mm，請加大安全邊。"
                                  : "請補出血 3mm，並轉曲線後重傳。";
                              setSku(
                                sku.id,
                                { status: "待補件", rejectReason: reason },
                                `退件：${reason}`,
                              );
                              log(`${sku.code} 退件：${reason}`);
                            }}
                          >
                            退件
                          </Btn>
                          <Btn
                            variant="primary"
                            onClick={() => {
                              setSku(
                                sku.id,
                                { status: "已核准", rejectReason: undefined },
                                "檢稿通過",
                              );
                              log(`${sku.code} 檢稿通過。`);
                            }}
                          >
                            核准
                          </Btn>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        );

      case "fixup":
        return (
          <Card
            title="客戶補件"
            badge={<Badge tone="info">客戶</Badge>}
            actions={
              <Btn
                variant="primary"
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    skus: prev.skus.map((s) =>
                      s.status === "待補件"
                        ? {
                            ...s,
                            status: "補件待檢",
                            assignedFiles: [
                              ...s.assignedFiles,
                              `${s.code}_補件v2.pdf`,
                            ],
                          }
                        : s,
                    ),
                  }));
                  log("客戶已補傳退件品項。");
                  flash("已模擬補傳，請員工再次檢稿");
                  go("review");
                }}
              >
                模擬補傳
              </Btn>
            }
          >
            <p className="mb-3 text-[13px] text-[#616161]">
              客戶只會看到被退件的品項與原因；補傳後該款回到待檢稿，不影響已核准品項。
            </p>
            <ul className="space-y-2">
              {state.skus
                .filter((s) => s.status === "待補件" || s.rejectReason)
                .map((s) => (
                  <li key={s.id}>
                    <Banner tone="critical" title={`${s.code}｜${s.name}`}>
                      {s.rejectReason}
                    </Banner>
                  </li>
                ))}
              {!state.skus.some((s) => s.rejectReason) && (
                <li className="text-[13px] text-[#616161]">目前沒有退件品項</li>
              )}
            </ul>
          </Card>
        );

      case "pay-notify":
        return (
          <Card
            title="通知付款"
            badge={<Badge tone="warning">員工</Badge>}
            actions={
              <Btn
                variant="primary"
                onClick={() => {
                  setState((prev) => ({ ...prev, paymentNotified: true }));
                  log("已寄出付款通知給客戶。");
                  flash("已模擬寄出付款通知");
                  go("transfer");
                }}
              >
                傳送付款通知
              </Btn>
            }
          >
            <p className="text-[13px] text-[#616161]">
              三款名片皆核准後，整單進入「待付款」。本期採人工轉帳，不串金流。
            </p>
          </Card>
        );

      case "transfer":
        return (
          <Card
            title="轉帳回報"
            badge={<Badge tone="info">客戶</Badge>}
            actions={
              state.transfer ? (
                <Btn
                  variant="primary"
                  onClick={() => {
                    go("verify");
                    flash("切換員工核帳");
                  }}
                >
                  以員工身分核帳
                </Btn>
              ) : null
            }
          >
            {state.transfer ? (
              <Banner tone="success" title={`已回報末五碼 ${state.transfer.lastFive}`}>
                金額 NT$ {state.transfer.amount.toLocaleString("zh-TW")}｜匯款日{" "}
                {state.transfer.paidAt}
              </Banner>
            ) : (
              <form
                className="flex max-w-sm flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const lastFive = String(fd.get("lastFive") || "88321");
                  setState((prev) => ({
                    ...prev,
                    transfer: {
                      lastFive,
                      amount: prev.totalAmount,
                      paidAt: "2026-11-04",
                      submittedAt: nowLabel(),
                    },
                  }));
                  log(`客戶回報轉帳，末五碼 ${lastFive}。`);
                }}
              >
                <label className="text-[13px]">
                  <span className="mb-1 block font-medium">帳號末五碼</span>
                  <input
                    name="lastFive"
                    defaultValue="88321"
                    className="h-9 w-full rounded-lg border border-[#8a8a8a] bg-white px-3 text-[13px] outline-none focus:border-[#005bd3] focus:shadow-[0_0_0_2px_#cfe3ff]"
                  />
                </label>
                <div>
                  <Btn type="submit" variant="primary">
                    送出回報
                  </Btn>
                </div>
              </form>
            )}
          </Card>
        );

      case "verify":
        return (
          <Card
            title="人工核帳"
            badge={<Badge tone="warning">員工</Badge>}
            actions={
              <Btn
                variant="primary"
                disabled={!state.transfer || state.paymentVerified}
                onClick={() => {
                  setState((prev) => ({ ...prev, paymentVerified: true }));
                  log("員工確認已收款。");
                  flash("已確認收款");
                  go("print");
                }}
              >
                標記為已付款
              </Btn>
            }
          >
            <p className="text-[13px] text-[#616161]">
              員工比對銀行明細與客戶回報的末五碼／金額後，手動標記已收款。
            </p>
            {state.transfer ? (
              <p className="mt-3 text-[13px]">
                末五碼 {state.transfer.lastFive}｜NT${" "}
                {state.transfer.amount.toLocaleString("zh-TW")}｜回報於{" "}
                {state.transfer.submittedAt}
              </p>
            ) : (
              <p className="mt-3 text-[13px] text-[#616161]">客戶尚未回報轉帳</p>
            )}
          </Card>
        );

      case "print":
        return (
          <Card
            title="發印與進度"
            badge={<Badge tone="warning">員工</Badge>}
            actions={
              !state.printing ? (
                <Btn
                  variant="primary"
                  disabled={!state.paymentVerified}
                  onClick={() => {
                    setState((prev) => ({ ...prev, printing: true }));
                    log("訂單已發印，狀態改為印製中。");
                    flash("狀態 → 印製中");
                  }}
                >
                  發印
                </Btn>
              ) : !state.shipped ? (
                <Btn
                  variant="primary"
                  onClick={() => {
                    setState((prev) => ({
                      ...prev,
                      shipped: true,
                      shippingNote: "黑貓宅急便｜託運單 DEMO-6110-2244",
                    }));
                    log("訂單已出貨：黑貓宅急便 DEMO-6110-2244。");
                    flash("已出貨");
                  }}
                >
                  標記為已出貨
                </Btn>
              ) : null
            }
          >
            <ol className="space-y-2 text-[13px]">
              <li className="flex items-center gap-2">
                <Badge tone={state.paymentVerified ? "success" : "default"}>
                  {state.paymentVerified ? "完成" : "等待"}
                </Badge>
                核帳通過，可發印
              </li>
              <li className="flex items-center gap-2">
                <Badge tone={state.printing ? "success" : "default"}>
                  {state.printing ? "完成" : "等待"}
                </Badge>
                印製中（客戶端同步看得到進度）
              </li>
              <li className="flex items-center gap-2">
                <Badge tone={state.shipped ? "success" : "default"}>
                  {state.shipped ? "完成" : "等待"}
                </Badge>
                已出貨 {state.shippingNote ? `｜${state.shippingNote}` : ""}
              </li>
            </ol>
            {state.shipped ? (
              <div className="mt-3">
                <Banner tone="success">
                  流程示範走完，可按右上「重設 Demo」再演一次。
                </Banner>
              </div>
            ) : null}
          </Card>
        );
    }
  })();

  const NAV = [
    { label: "首頁", icon: "⌂" },
    { label: "訂單", icon: "▤", active: true, count: 5 },
    { label: "商品", icon: "◫" },
    { label: "客戶", icon: "☺" },
    { label: "分析", icon: "▥" },
    { label: "行銷", icon: "◎" },
    { label: "折扣", icon: "％" },
  ];

  const unpaidNow = !state.paymentVerified;
  const unfulfilledNow = !state.shipped;

  const listRows = [
    {
      no: state.orderNo,
      date: "11月4日 10:18",
      customer: state.customer,
      total: state.totalAmount,
      items: "3 項（名片 A／B／C）",
      pay: payBadge,
      fulfill: fulfillBadge,
      unpaid: unpaidNow,
      unfulfilled: unfulfilledNow,
      demo: true,
    },
    {
      no: "OY-20261028-014",
      date: "10月28日 11:20",
      customer: "林小芸",
      total: 1680,
      items: "精品名片 × 200",
      pay: <Badge tone="default" dot="empty">尚未請款</Badge>,
      fulfill: <Badge tone="attention" dot="empty">未發印</Badge>,
      unpaid: true,
      unfulfilled: true,
    },
    {
      no: "OY-20261027-009",
      date: "10月27日 19:05",
      customer: "王詩涵",
      total: 12400,
      items: "型錄 16P × 300",
      pay: <Badge tone="attention" dot="empty">待付款</Badge>,
      fulfill: <Badge tone="attention" dot="empty">未發印</Badge>,
      unpaid: true,
      unfulfilled: true,
    },
    {
      no: "OY-20261026-004",
      date: "10月26日 09:48",
      customer: "張雅婷",
      total: 15800,
      items: "抽屜式包裝盒 × 80",
      pay: <Badge tone="success" dot="full">已付款</Badge>,
      fulfill: <Badge tone="info" dot="partial">印製中</Badge>,
      unpaid: false,
      unfulfilled: true,
    },
    {
      no: "OY-20261025-002",
      date: "10月25日 17:30",
      customer: "吳承翰",
      total: 3600,
      items: "A2 海報 × 80",
      pay: <Badge tone="success" dot="full">已付款</Badge>,
      fulfill: <Badge tone="success" dot="full">已出貨</Badge>,
      unpaid: false,
      unfulfilled: false,
    },
  ];

  const q = search.trim().toLowerCase();
  const filteredRows = listRows.filter((r) => {
    if (listTab === "unfulfilled" && !r.unfulfilled) return false;
    if (listTab === "unpaid" && !r.unpaid) return false;
    if (!q) return true;
    return (
      r.no.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) ||
      r.items.toLowerCase().includes(q)
    );
  });

  const listView = (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold">訂單</h1>
        <div className="flex gap-2">
          <Btn onClick={() => flash("匯出僅示意")}>匯出</Btn>
          <Btn variant="primary" onClick={() => flash("建立訂單僅示意")}>
            建立訂單
          </Btn>
        </div>
      </div>
      <div className="mt-4">
        <section className={CARD}>
          <div className="flex flex-wrap items-center gap-1 border-b border-[#ebebeb] px-3 py-2">
            {(
              [
                ["all", "全部"],
                ["unfulfilled", "未發印"],
                ["unpaid", "待付款"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setListTab(id)}
                className={`rounded-lg px-3 py-1 text-[13px] ${
                  listTab === id
                    ? "bg-[#e3e3e3] font-semibold"
                    : "text-[#616161] hover:bg-[#f1f1f1]"
                }`}
              >
                {label}
              </button>
            ))}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋訂單、客戶、品項"
              className="ml-auto h-8 w-full rounded-lg border border-[#8a8a8a] bg-white px-3 text-[13px] outline-none focus:border-[#005bd3] sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-[13px]">
              <thead className="bg-[#f7f7f7] text-[12px] font-medium text-[#616161]">
                <tr>
                  <th className="px-4 py-2">訂單</th>
                  <th className="px-4 py-2">日期</th>
                  <th className="px-4 py-2">客戶</th>
                  <th className="px-4 py-2 text-right">金額</th>
                  <th className="px-4 py-2">付款</th>
                  <th className="px-4 py-2">出貨</th>
                  <th className="px-4 py-2">品項</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {filteredRows.map((r) => (
                  <tr
                    key={r.no}
                    onClick={() => {
                      if (r.demo) {
                        setView("detail");
                      } else {
                        flash("此為列表假資料；僅 #OY-20261104-088 可完整操作");
                      }
                    }}
                    className="cursor-pointer hover:bg-[#fafafa]"
                  >
                    <td className="px-4 py-3 font-semibold">#{r.no}</td>
                    <td className="px-4 py-3 text-[#616161]">{r.date}</td>
                    <td className="px-4 py-3">{r.customer}</td>
                    <td className="px-4 py-3 text-right">
                      NT$ {r.total.toLocaleString("zh-TW")}
                    </td>
                    <td className="px-4 py-3">{r.pay}</td>
                    <td className="px-4 py-3">{r.fulfill}</td>
                    <td className="px-4 py-3 text-[#616161]">{r.items}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-[#616161]"
                    >
                      找不到符合的訂單
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-[#1a1a1a] px-3 text-white">
        <button
          type="button"
          aria-label="選單"
          onClick={() => setNavOpen((v) => !v)}
          className="rounded-lg px-2 py-1.5 text-lg hover:bg-white/10 lg:hidden"
        >
          ☰
        </button>
        <div className="flex items-center gap-2 pr-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e85a12] text-[13px] font-bold">
            橙
          </span>
          <span className="hidden text-[14px] font-semibold sm:inline">
            橙益印刷
          </span>
        </div>
        <label className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-lg bg-[#303030] px-3 py-1.5 text-[13px] text-white/60 ring-1 ring-white/10 focus-within:bg-white focus-within:text-[#303030]">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setView("list");
            }}
            placeholder="搜尋訂單、客戶"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/50 focus:placeholder:text-[#8a8a8a]"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[12px] opacity-70 hover:opacity-100"
            >
              清除
            </button>
          ) : null}
        </label>
        <div className="flex items-center gap-2">
          <Link
            href="/demo/member"
            target="_blank"
            className="hidden rounded-lg bg-white/10 px-2.5 py-1 text-[12px] text-white hover:bg-white/20 md:inline"
          >
            開啟會員前台 ↗
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e85a12] text-[12px] font-semibold">
            員
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside
          className={`${
            navOpen ? "block" : "hidden"
          } fixed inset-y-14 left-0 z-20 w-60 shrink-0 bg-[#ebebeb] p-2 lg:static lg:block`}
        >
          <nav className="space-y-0.5">
            {NAV.map((n) => (
              <a
                key={n.label}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setNavOpen(false);
                  if (n.label === "訂單") {
                    setView("list");
                  } else {
                    flash(`「${n.label}」為示範未開放功能`);
                  }
                }}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] ${
                  n.active
                    ? "bg-white font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
                    : "text-[#303030] hover:bg-[#f7f7f7]"
                }`}
              >
                <span className="w-4 text-center text-[#616161]">{n.icon}</span>
                <span className="flex-1">{n.label}</span>
                {n.count ? (
                  <span className="rounded-full bg-[#e3e3e3] px-1.5 text-[11px]">
                    {n.count}
                  </span>
                ) : null}
              </a>
            ))}
          </nav>
          <p className="mt-5 px-2.5 text-[11px] font-medium text-[#616161]">
            銷售管道
          </p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] hover:bg-[#f7f7f7]"
          >
            <span className="w-4 text-center text-[#616161]">▣</span>
            線上商店
          </a>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-[62rem]">
            {toast ? (
              <div className="mb-4">
                <Banner tone="success">{toast}</Banner>
              </div>
            ) : null}
            {view === "list" ? (
              listView
            ) : (
              <>
            {/* Page header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-label="返回訂單列表"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#616161] shadow-[0_0_0_1px_#e3e3e3] hover:bg-white"
                  >
                    ←
                  </button>
                  <h1 className="text-[20px] font-bold leading-7">
                    #{state.orderNo}
                  </h1>
                  {payBadge}
                  {fulfillBadge}
                  {artworkBadge}
                </div>
                <p className="mt-1 pl-9 text-[13px] text-[#616161]">
                  {state.createdAt} 於線上商店
                </p>
              </div>
              <div className="flex gap-2">
                <Btn onClick={reset}>重設 Demo</Btn>
                <Btn onClick={() => window.print()}>列印</Btn>
              </div>
            </div>

            {/* Flow tracker */}
            <div className="mt-4">
              <Card flush>
                <ol className="flex gap-1 overflow-x-auto px-3 pb-3">
                  {FLOW_STEPS.map((s, i) => {
                    const can = unlocked.has(s.id);
                    const active = s.id === step;
                    const done = i < currentIndex || (i < activeIndex && can);
                    return (
                      <li key={s.id} className="shrink-0">
                        <button
                          type="button"
                          disabled={!can}
                          onClick={() => setStep(s.id)}
                          className={`flex min-w-[6.75rem] items-center gap-2 rounded-lg px-2.5 py-2 text-left ${
                            active
                              ? "bg-[#f1f1f1] shadow-[inset_0_0_0_1px_#303030]"
                              : can
                                ? "hover:bg-[#f7f7f7]"
                                : "opacity-45"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                              done
                                ? "bg-[#303030] text-white"
                                : active
                                  ? "border-2 border-[#303030] text-[#303030]"
                                  : "border border-[#8a8a8a] text-[#616161]"
                            }`}
                          >
                            {done ? "✓" : i + 1}
                          </span>
                          <span>
                            <span className="block text-[12px] font-medium leading-4">
                              {s.label}
                            </span>
                            <span className="block text-[11px] leading-4 text-[#616161]">
                              {s.actor}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </Card>
            </div>

            {/* Two-column layout */}
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                {stepPanel}

                {/* Line items */}
                <Card
                  title={`品項（${state.skus.length}）`}
                  badge={
                    state.shipped ? (
                      <Badge tone="success" dot="full">
                        已出貨
                      </Badge>
                    ) : (
                      <Badge tone="attention" dot="empty">
                        未發印
                      </Badge>
                    )
                  }
                  flush
                >
                  <ul className="divide-y divide-[#ebebeb]">
                    {state.skus.map((sku) => (
                      <li
                        key={sku.id}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <Thumb code={sku.code} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#005bd3]">
                            {sku.name}
                          </p>
                          <p className="text-[12px] text-[#616161]">
                            {sku.code}｜300g 象牙卡／雙面彩／霧膜
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {sku.assignedFiles.map((f) => (
                              <span
                                key={f}
                                className="rounded-md bg-[#f1f1f1] px-1.5 py-0.5 font-mono text-[11px] text-[#616161]"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge tone={skuTone(sku.status)}>{sku.status}</Badge>
                          <p className="mt-1 text-[12px] text-[#616161]">
                            {sku.quantityLabel}
                          </p>
                          <p className="text-[13px]">
                            NT$ {sku.amount.toLocaleString("zh-TW")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Payment */}
                <Card title="付款" badge={payBadge}>
                  <dl className="space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-[#616161]">小計（3 項）</dt>
                      <dd>NT$ {state.totalAmount.toLocaleString("zh-TW")}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#616161]">運費</dt>
                      <dd>NT$ 0</dd>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <dt>合計</dt>
                      <dd>NT$ {state.totalAmount.toLocaleString("zh-TW")}</dd>
                    </div>
                    <div className="flex justify-between border-t border-[#ebebeb] pt-2">
                      <dt className="text-[#616161]">已付款</dt>
                      <dd>
                        NT${" "}
                        {state.paymentVerified
                          ? state.totalAmount.toLocaleString("zh-TW")
                          : "0"}
                      </dd>
                    </div>
                    {state.paymentNotified && !state.paymentVerified ? (
                      <div className="flex justify-between">
                        <dt className="text-[#616161]">匯款帳戶（示意）</dt>
                        <dd>台新銀行 000-123456789012</dd>
                      </div>
                    ) : null}
                  </dl>
                </Card>

                {/* Timeline */}
                <section>
                  <h2 className="mb-2 text-[14px] font-semibold">時間軸</h2>
                  <div className={`${CARD} p-4`}>
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e85a12] text-[12px] font-semibold text-white">
                        員
                      </span>
                      <div className="flex-1">
                        <div className="rounded-lg border border-[#8a8a8a] focus-within:border-[#005bd3] focus-within:shadow-[0_0_0_2px_#cfe3ff]">
                          <textarea
                            value={commentDraft}
                            onChange={(e) => setCommentDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                (e.metaKey || e.ctrlKey)
                              ) {
                                postComment();
                              }
                            }}
                            rows={2}
                            placeholder="留下備註…（⌘/Ctrl + Enter 發佈）"
                            className="w-full resize-none rounded-lg bg-transparent px-3 py-2 text-[13px] outline-none"
                          />
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Btn
                            variant="primary"
                            disabled={!commentDraft.trim()}
                            onClick={postComment}
                          >
                            發佈
                          </Btn>
                        </div>
                      </div>
                    </div>
                    <ol className="mt-4 space-y-4 border-l border-[#e3e3e3] pl-4">
                      {events.map((e, i) => (
                        <li key={`${e.at}-${i}`} className="relative">
                          <span className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-[#8a8a8a]" />
                          <div className="flex items-start justify-between gap-3 text-[13px]">
                            <p>
                              {e.text}
                              {e.internal ? (
                                <span className="ml-2 rounded-md bg-[#f1f1f1] px-1.5 py-0.5 text-[11px] text-[#616161]">
                                  內部
                                </span>
                              ) : null}
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

              {/* Right column */}
              <aside className="space-y-4">
                <Card
                  title="備註"
                  actions={
                    editingNote ? null : (
                      <Btn
                        variant="plain"
                        onClick={() => {
                          setNoteDraft(notes);
                          setEditingNote(true);
                        }}
                      >
                        編輯
                      </Btn>
                    )
                  }
                >
                  {editingNote ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-[#8a8a8a] px-3 py-2 text-[13px] outline-none focus:border-[#005bd3] focus:shadow-[0_0_0_2px_#cfe3ff]"
                      />
                      <div className="flex justify-end gap-2">
                        <Btn onClick={() => setEditingNote(false)}>取消</Btn>
                        <Btn variant="primary" onClick={saveNote}>
                          儲存
                        </Btn>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#616161]">
                      {notes || "沒有備註"}
                    </p>
                  )}
                </Card>

                <Card
                  title="客戶"
                  actions={
                    <Btn
                      variant="plain"
                      onClick={() => setCustomerOpen((v) => !v)}
                    >
                      {customerOpen ? "收合" : "檢視"}
                    </Btn>
                  }
                >
                  <p className="text-[13px] font-medium text-[#005bd3]">
                    {state.customer}
                  </p>
                  <p className="text-[13px] text-[#616161]">{state.company}</p>
                  <p className="mt-1 text-[13px] text-[#005bd3]">
                    <button
                      type="button"
                      onClick={() => {
                        setSearch(state.customer);
                        setView("list");
                      }}
                      className="hover:underline"
                    >
                      2 筆訂單
                    </button>
                  </p>
                  {customerOpen ? (
                    <div className="mt-3 rounded-lg bg-[#f7f7f7] p-3 text-[12px] leading-5 text-[#616161]">
                      <p>會員等級：一般會員</p>
                      <p>累計消費：NT$ {(state.totalAmount + 1680).toLocaleString("zh-TW")}</p>
                      <p>加入日期：2026-09-12</p>
                      <p>偏好聯絡：Email／LINE</p>
                    </div>
                  ) : null}

                  <hr className="my-3 border-[#ebebeb]" />
                  <p className="text-[12px] font-semibold">聯絡資訊</p>
                  <p className="mt-1 text-[13px] text-[#005bd3]">
                    yun.lin@example.com
                  </p>
                  <p className="text-[13px] text-[#616161]">0912-345-678</p>

                  <hr className="my-3 border-[#ebebeb]" />
                  <p className="text-[12px] font-semibold">配送地址</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#616161]">
                    林小芸
                    <br />
                    臺中市南屯區大墩十四街 270 號 5 樓
                    <br />
                    台灣
                  </p>

                  <hr className="my-3 border-[#ebebeb]" />
                  <p className="text-[12px] font-semibold">帳單地址</p>
                  <p className="mt-1 text-[13px] text-[#616161]">
                    與配送地址相同
                  </p>
                </Card>

                <Card
                  title="標籤"
                  actions={
                    <Btn
                      variant="plain"
                      onClick={() => setEditingTags((v) => !v)}
                    >
                      {editingTags ? "完成" : "管理"}
                    </Btn>
                  }
                >
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#e3e3e3] px-2 py-0.5 text-[12px]"
                      >
                        {t}
                        {editingTags ? (
                          <button
                            type="button"
                            aria-label={`移除 ${t}`}
                            onClick={() => {
                              setTags((prev) => prev.filter((x) => x !== t));
                              log(`員工移除標籤「${t}」。`, true);
                            }}
                            className="text-[#616161] hover:text-[#8e0b21]"
                          >
                            ×
                          </button>
                        ) : null}
                      </span>
                    ))}
                    {tags.length === 0 ? (
                      <span className="text-[13px] text-[#616161]">沒有標籤</span>
                    ) : null}
                  </div>
                  {editingTags ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addTag();
                        }}
                        placeholder="新增標籤"
                        className="h-8 min-w-0 flex-1 rounded-lg border border-[#8a8a8a] px-3 text-[13px] outline-none focus:border-[#005bd3]"
                      />
                      <Btn onClick={addTag} disabled={!tagDraft.trim()}>
                        新增
                      </Btn>
                    </div>
                  ) : null}
                </Card>

                <p className="px-1 text-[12px] leading-5 text-[#616161]">
                  Demo：畫面與操作為假資料示意，不含正式資料庫、真實上傳或解壓。
                </p>
              </aside>
            </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
