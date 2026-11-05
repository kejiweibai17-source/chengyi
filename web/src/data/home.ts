export const navItems = [
  { label: "關於橙益", href: "/about" },
  { label: "服務項目", href: "/services" },
  { label: "公司地點", href: "/location" },
  { label: "常見問題", href: "/faq" },
  { label: "印刷相關知識", href: "/knowledge" },
] as const;

export const heroSlides = [
  {
    id: 1,
    title: "把想法印成看得見的東西",
    subtitle: "包裝盒、型錄、名片與客製印刷——從規格到完稿，一路陪你對齊。",
    cta: "瀏覽服務項目",
    href: "/services",
    image:
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "印刷廠紙張與油墨作業場景",
  },
  {
    id: 2,
    title: "線上下單，人工檢稿把關",
    subtitle: "上傳檔案、追蹤進度、轉帳回報——訂單狀態一次看清楚。",
    cta: "開始下單",
    href: "/services",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "設計完稿與文件整理",
  },
  {
    id: 3,
    title: "包裝盒 3D 先看再詢價",
    subtitle: "掀蓋郵寄盒／內襯可調尺寸預覽，確認外觀與結構後再送出詢價。",
    cta: "體驗 3D 盒型",
    href: "/services/packaging-3d",
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "包裝盒產品陳列",
  },
] as const;

export const newsItems = [
  {
    id: 1,
    date: "2026.10.28",
    tag: "公告",
    title: "線上會員下單與檔案上傳功能即將開放預覽",
  },
  {
    id: 2,
    date: "2026.10.15",
    tag: "服務",
    title: "包裝盒 3D 示意預覽：先開放一種盒型供確認操作",
  },
  {
    id: 3,
    date: "2026.09.30",
    tag: "作品",
    title: "近期完成：精品茶葉禮盒與名片系列更新",
  },
] as const;

export const aboutPoints = [
  {
    label: "公司介紹",
    href: "/about/intro",
    text: "台中南屯印刷與包裝設計團隊，專注完稿品質與交付節奏。",
  },
  {
    label: "合作流程",
    href: "/about/process",
    text: "規格確認 → 完稿／檢稿 → 印製 → 出貨，步驟清楚可追蹤。",
  },
  {
    label: "設計作品",
    href: "/about/works",
    text: "包裝、視覺與印刷成品案例，作為規格討論的起點。",
  },
] as const;

export const services = [
  {
    id: "print",
    title: "印刷下單",
    text: "選商品、規格與加工；可整包 ZIP 上傳，員工分款檢稿後再付款。",
    href: "/demo/manuscript-flow",
  },
  {
    id: "design",
    title: "設計洽詢",
    text: "需要排版或包裝設計時，由專人承接，不走線上審稿。",
    href: "/services/design",
  },
  {
    id: "box3d",
    title: "包裝盒 3D",
    text: "掀蓋郵寄盒／內襯可調尺寸預覽與詢價，外觀示意、不做估價下單。",
    href: "/services/packaging-3d",
  },
] as const;

export const footerColumns = [
  {
    title: "關於橙益",
    links: [
      { label: "公司介紹", href: "/about/intro" },
      { label: "合作流程", href: "/about/process" },
      { label: "設計作品", href: "/about/works" },
    ],
  },
  {
    title: "服務",
    links: [
      { label: "印刷下單", href: "/services/print" },
      { label: "設計洽詢", href: "/services/design" },
      { label: "包裝盒 3D", href: "/services/packaging-3d" },
    ],
  },
  {
    title: "協助",
    links: [
      { label: "常見問題", href: "/faq" },
      { label: "公司地點", href: "/location" },
      { label: "印刷相關知識", href: "/knowledge" },
    ],
  },
] as const;
