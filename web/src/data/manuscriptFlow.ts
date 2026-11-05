/** 下單與稿件處理流程 Demo — 假資料（無真實上傳／解壓／資料庫） */

export const FLOW_STEPS = [
  { id: "order", label: "下單確認", actor: "客戶" },
  { id: "upload", label: "整包上傳 ZIP", actor: "客戶" },
  { id: "sort", label: "人工分款", actor: "員工" },
  { id: "review", label: "逐款檢稿", actor: "員工" },
  { id: "fixup", label: "補件重傳", actor: "客戶" },
  { id: "pay-notify", label: "通知付款", actor: "員工" },
  { id: "transfer", label: "轉帳回報", actor: "客戶" },
  { id: "verify", label: "人工核帳", actor: "員工" },
  { id: "print", label: "發印／進度", actor: "員工" },
] as const;

export type FlowStepId = (typeof FLOW_STEPS)[number]["id"];

export type SkuReviewStatus =
  | "未分款"
  | "待檢稿"
  | "待補件"
  | "已核准"
  | "補件待檢";

export type DemoSku = {
  id: string;
  name: string;
  code: string;
  quantityLabel: string;
  amount: number;
  status: SkuReviewStatus;
  rejectReason?: string;
  assignedFiles: string[];
  history: { at: string; text: string }[];
};

export type DemoFlowState = {
  orderNo: string;
  customer: string;
  company: string;
  createdAt: string;
  totalAmount: number;
  zipName: string | null;
  zipUploadedAt: string | null;
  zipNote: string;
  unsortedFiles: string[];
  skus: DemoSku[];
  paymentNotified: boolean;
  transfer?: {
    lastFive: string;
    amount: number;
    paidAt: string;
    submittedAt: string;
  };
  paymentVerified: boolean;
  printing: boolean;
  shipped: boolean;
  shippingNote?: string;
};

export const DEMO_ZIP_CONTENTS = [
  "名片A_正面.pdf",
  "名片A_背面.pdf",
  "名片B_完稿.ai",
  "名片C_雙面.pdf",
  "名片C_備註.txt",
  "舊版_請勿使用.pdf",
];

export function createInitialFlowState(): DemoFlowState {
  return {
    orderNo: "OY-20261104-088",
    customer: "林小芸",
    company: "小芸工作室有限公司",
    createdAt: "2026-11-04 10:18",
    totalAmount: 4080,
    zipName: null,
    zipUploadedAt: null,
    zipNote: "三款名片各兩盒，檔案全部壓在同一個 ZIP。",
    unsortedFiles: [],
    skus: [
      {
        id: "sku-a",
        name: "精品名片 A｜品牌主視覺",
        code: "CARD-A",
        quantityLabel: "2 盒／共 200 張",
        amount: 1360,
        status: "未分款",
        assignedFiles: [],
        history: [],
      },
      {
        id: "sku-b",
        name: "精品名片 B｜業務名片",
        code: "CARD-B",
        quantityLabel: "2 盒／共 200 張",
        amount: 1360,
        status: "未分款",
        assignedFiles: [],
        history: [],
      },
      {
        id: "sku-c",
        name: "精品名片 C｜活動限定",
        code: "CARD-C",
        quantityLabel: "2 盒／共 200 張",
        amount: 1360,
        status: "未分款",
        assignedFiles: [],
        history: [],
      },
    ],
    paymentNotified: false,
    paymentVerified: false,
    printing: false,
    shipped: false,
  };
}

/** 員工後台＋會員前台共用的事件紀錄（internal=僅員工可見） */
export type DemoEvent = { at: string; text: string; internal?: boolean };

/** 依訂單資料推算「流程已走到第幾步」，用來讓員工頁自動解鎖步驟 */
export function deriveStepIndex(flow: DemoFlowState): number {
  const idx = (id: (typeof FLOW_STEPS)[number]["id"]) =>
    FLOW_STEPS.findIndex((s) => s.id === id);
  if (flow.printing || flow.shipped || flow.paymentVerified) return idx("print");
  if (flow.transfer) return idx("verify");
  if (flow.paymentNotified) return idx("transfer");
  if (allSkusApproved(flow.skus)) return idx("pay-notify");
  if (anySkuNeedsFixup(flow.skus)) return idx("fixup");
  if (flow.skus.some((s) => s.assignedFiles.length > 0)) return idx("review");
  if (flow.zipName) return idx("sort");
  return idx("order");
}

export type CustomerPhase = 0 | 1 | 2 | 3 | 4;

/** 會員前台顯示用：把後台細節收斂成客戶看得懂的狀態 */
export function customerStatus(flow: DemoFlowState): {
  label: string;
  tone: "default" | "info" | "success" | "warning" | "attention" | "critical";
  hint: string;
  /** 0 訂單成立 1 稿件審核 2 付款 3 印製 4 出貨 */
  phase: CustomerPhase;
  needsAction?: "upload" | "fixup" | "transfer";
} {
  if (flow.shipped)
    return {
      label: "已出貨",
      tone: "success",
      hint: "商品已寄出，可在下方查看物流資訊。",
      phase: 4,
    };
  if (flow.printing)
    return {
      label: "印製中",
      tone: "info",
      hint: "款項已確認，正在印製與加工。",
      phase: 3,
    };
  if (flow.paymentVerified)
    return {
      label: "已收款",
      tone: "success",
      hint: "款項已確認，即將安排印製。",
      phase: 3,
    };
  if (flow.transfer)
    return {
      label: "款項確認中",
      tone: "warning",
      hint: "已收到您的轉帳回報，人工核帳中。",
      phase: 2,
    };
  if (flow.paymentNotified)
    return {
      label: "待付款",
      tone: "attention",
      hint: "稿件皆已通過，請轉帳後在下方回報匯款資訊。",
      phase: 2,
      needsAction: "transfer",
    };
  if (allSkusApproved(flow.skus))
    return {
      label: "稿件全部合格",
      tone: "success",
      hint: "三款稿件皆通過，客服即將通知您付款。",
      phase: 1,
    };
  if (anySkuNeedsFixup(flow.skus))
    return {
      label: "待補件",
      tone: "critical",
      hint: "部分稿件需要修正，請依退件原因補傳。",
      phase: 1,
      needsAction: "fixup",
    };
  if (flow.zipName) {
    const sorting = !flow.skus.some((s) => s.assignedFiles.length > 0);
    return {
      label: sorting ? "稿件整理中" : "稿件審核中",
      tone: "info",
      hint: sorting
        ? "已收到您的 ZIP，客服正在整理分款。"
        : "客服正在逐款檢查稿件，通過後會通知您。",
      phase: 1,
    };
  }
  return {
    label: "待上傳稿件",
    tone: "attention",
    hint: "請把三款名片的完稿整包壓成 ZIP 上傳。",
    phase: 0,
    needsAction: "upload",
  };
}

export function allSkusApproved(skus: DemoSku[]) {
  return skus.length > 0 && skus.every((s) => s.status === "已核准");
}

export function anySkuNeedsFixup(skus: DemoSku[]) {
  return skus.some((s) => s.status === "待補件");
}
