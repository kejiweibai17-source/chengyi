import type { Metadata } from "next";
import { MemberPortalDemo } from "@/components/demo/MemberPortalDemo";

export const metadata: Metadata = {
  title: "我的訂單｜橙益印刷（會員前台 Demo）",
  description:
    "會員前台示範：即時接收員工後台的訂單狀態變更，並可上傳稿件、補件與回報轉帳（假資料）",
};

export default function MemberPortalDemoPage() {
  return <MemberPortalDemo />;
}
