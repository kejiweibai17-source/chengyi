import type { Metadata } from "next";
import { ManuscriptFlowDemo } from "@/components/demo/ManuscriptFlowDemo";

export const metadata: Metadata = {
  title: "訂單 #OY-20261104-088｜橙益後台（Demo）",
  description:
    "三款名片各兩盒：客戶整包上傳 ZIP，員工人工分款、逐款檢稿與補件，合格後通知付款、核帳發印（假資料 Demo）",
};

export default function ManuscriptFlowDemoPage() {
  return <ManuscriptFlowDemo />;
}
