/** 依合約附件 H：狀態骨架 */
export const ORDER_STATUSES = [
  "待上傳",
  "待檢稿",
  "待補件",
  "確認可印製",
  "待付款",
  "已收款",
  "印製中",
  "已出貨",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type UploadVersion = {
  version: number;
  fileName: string;
  uploadedAt: string;
  note?: string;
  approved?: boolean;
};

export type OrderItem = {
  id: string;
  productName: string;
  specs: string;
  quantity: number;
  amount: number;
  status: OrderStatus;
  rejectReason?: string;
  uploads: UploadVersion[];
};

export type TransferReport = {
  lastFive: string;
  amount: number;
  paidAt: string;
  note?: string;
  submittedAt: string;
};

export type MemberOrder = {
  id: string;
  orderNo: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  transfer?: TransferReport;
  shippingNote?: string;
};

export const demoMember = {
  name: "林小芸",
  email: "yun.lin@example.com",
  phone: "0912-345-678",
  company: "小芸工作室有限公司",
};

/** Demo：模擬已登入會員的訂單（對齊附件 H 流程節點） */
export const memberOrders: MemberOrder[] = [
  {
    id: "zip-3cards",
    orderNo: "OY-20261104-088",
    createdAt: "2026-11-04 10:18",
    updatedAt: "2026-11-04 10:42",
    status: "待檢稿",
    totalAmount: 4080,
    items: [
      {
        id: "zip-a",
        productName: "精品名片 A｜品牌主視覺",
        specs: "300g 象牙卡／雙面彩／霧膜／90×54mm",
        quantity: 200,
        amount: 1360,
        status: "待檢稿",
        uploads: [
          {
            version: 1,
            fileName: "三款名片_完稿整包.zip（內含本款正面／背面）",
            uploadedAt: "2026-11-04 10:42",
            note: "整包 ZIP 上傳；待員工分款後逐款檢稿",
          },
        ],
      },
      {
        id: "zip-b",
        productName: "精品名片 B｜業務名片",
        specs: "300g 象牙卡／雙面彩／霧膜／90×54mm",
        quantity: 200,
        amount: 1360,
        status: "待檢稿",
        uploads: [
          {
            version: 1,
            fileName: "三款名片_完稿整包.zip（待分款）",
            uploadedAt: "2026-11-04 10:42",
            note: "與同訂單其他款共用整包 ZIP",
          },
        ],
      },
      {
        id: "zip-c",
        productName: "精品名片 C｜活動限定",
        specs: "300g 象牙卡／雙面彩／霧膜／90×54mm",
        quantity: 200,
        amount: 1360,
        status: "待檢稿",
        uploads: [
          {
            version: 1,
            fileName: "三款名片_完稿整包.zip（待分款）",
            uploadedAt: "2026-11-04 10:42",
            note: "與同訂單其他款共用整包 ZIP",
          },
        ],
      },
    ],
  },
  {
    id: "1",
    orderNo: "OY-20261029-001",
    createdAt: "2026-10-29 09:12",
    updatedAt: "2026-10-29 09:12",
    status: "待上傳",
    totalAmount: 680,
    items: [
      {
        id: "1-1",
        productName: "精品名片",
        specs: "300g 象牙卡／雙面彩／霧膜／90×54mm",
        quantity: 100,
        amount: 680,
        status: "待上傳",
        uploads: [],
      },
    ],
  },
  {
    id: "2",
    orderNo: "OY-20261028-014",
    createdAt: "2026-10-28 11:20",
    updatedAt: "2026-10-28 16:42",
    status: "待檢稿",
    totalAmount: 1680,
    items: [
      {
        id: "2-1",
        productName: "精品名片",
        specs: "300g 象牙卡／雙面彩／霧膜／90×54mm",
        quantity: 200,
        amount: 1680,
        status: "待檢稿",
        uploads: [
          {
            version: 1,
            fileName: "business-card-v1.pdf",
            uploadedAt: "2026-10-28 16:40",
            note: "首次上傳，等待人工檢稿",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    orderNo: "OY-20261027-011",
    createdAt: "2026-10-27 10:05",
    updatedAt: "2026-10-28 14:10",
    status: "待補件",
    totalAmount: 9600,
    items: [
      {
        id: "3-1",
        productName: "天地蓋禮盒",
        specs: "灰板裱銅版／內襯泡棉／外徑 200×150×80mm",
        quantity: 50,
        amount: 9600,
        status: "待補件",
        rejectReason: "出血不足 3mm，請補傳含出血之完稿檔。",
        uploads: [
          {
            version: 1,
            fileName: "giftbox-v1.pdf",
            uploadedAt: "2026-10-27 15:22",
            note: "檢稿未通過",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    orderNo: "OY-20261027-009",
    createdAt: "2026-10-26 18:40",
    updatedAt: "2026-10-27 19:05",
    status: "待付款",
    totalAmount: 12400,
    items: [
      {
        id: "4-1",
        productName: "企業型錄 16P",
        specs: "157g 銅版／騎馬釘／A4",
        quantity: 300,
        amount: 12400,
        status: "確認可印製",
        uploads: [
          {
            version: 1,
            fileName: "catalog-draft.pdf",
            uploadedAt: "2026-10-26 20:01",
          },
          {
            version: 2,
            fileName: "catalog-final.pdf",
            uploadedAt: "2026-10-27 11:18",
            note: "已核准印製",
            approved: true,
          },
        ],
      },
    ],
  },
  {
    id: "5",
    orderNo: "OY-20261026-004",
    createdAt: "2026-10-24 13:10",
    updatedAt: "2026-10-26 09:48",
    status: "印製中",
    totalAmount: 15800,
    items: [
      {
        id: "5-1",
        productName: "抽屜式包裝盒",
        specs: "可調尺寸示意轉單／外徑依詢價單",
        quantity: 80,
        amount: 15800,
        status: "印製中",
        uploads: [
          {
            version: 1,
            fileName: "drawer-box.ai.zip",
            uploadedAt: "2026-10-24 16:30",
            approved: true,
            note: "核准印製",
          },
        ],
      },
    ],
    transfer: {
      lastFive: "88321",
      amount: 15800,
      paidAt: "2026-10-25 14:20",
      submittedAt: "2026-10-25 14:22",
      note: "已收款",
    },
  },
  {
    id: "6",
    orderNo: "OY-20261020-002",
    createdAt: "2026-10-18 09:00",
    updatedAt: "2026-10-22 17:30",
    status: "已出貨",
    totalAmount: 3600,
    shippingNote: "黑貓宅急便｜託運單 6122-8899-001",
    items: [
      {
        id: "6-1",
        productName: "A2 海報",
        specs: "157g 銅版／單面彩",
        quantity: 80,
        amount: 3600,
        status: "已出貨",
        uploads: [
          {
            version: 1,
            fileName: "poster-a2.pdf",
            uploadedAt: "2026-10-18 11:05",
            approved: true,
          },
        ],
      },
    ],
    transfer: {
      lastFive: "22918",
      amount: 3600,
      paidAt: "2026-10-19 10:11",
      submittedAt: "2026-10-19 10:15",
    },
  },
];

export function getOrderById(id: string) {
  return memberOrders.find((order) => order.id === id);
}

export function statusIndex(status: OrderStatus) {
  return ORDER_STATUSES.indexOf(status);
}

export function statusHint(status: OrderStatus) {
  switch (status) {
    case "待上傳":
      return "請上傳印刷完稿檔（PDF／AI／ZIP）";
    case "待檢稿":
      return "橙益正在人工檢稿，通過後會通知您";
    case "待補件":
      return "請依退件原因補傳檔案";
    case "確認可印製":
      return "檔案已核准，接著會通知轉帳";
    case "待付款":
      return "請完成轉帳並於訂單頁回報匯款資訊";
    case "已收款":
      return "款項已確認，即將安排印製";
    case "印製中":
      return "正在印製／加工中";
    case "已出貨":
      return "已出貨，可於明細查看物流資訊";
    default:
      return "";
  }
}
