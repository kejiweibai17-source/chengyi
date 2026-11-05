import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusTimeline } from "@/components/member/OrderStatusTimeline";
import { StatusBadge } from "@/components/member/StatusBadge";
import { TransferPanel } from "@/components/member/TransferPanel";
import { UploadPanel } from "@/components/member/UploadPanel";
import {
  getOrderById,
  statusHint,
  type OrderStatus,
} from "@/data/member";

type Props = {
  params: Promise<{ id: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const order = getOrderById(id);
  return {
    title: order ? `${order.orderNo}｜會員訂單` : "訂單不存在",
  };
}

function canUpload(status: OrderStatus) {
  return status === "待上傳" || status === "待補件";
}

export default async function MemberOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  return (
    <div className="bg-paper">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <Link
            href="/member"
            className="text-sm text-mute transition-colors hover:text-brand"
          >
            ← 回到會員中心
          </Link>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-mono text-sm tracking-wide text-mute">
                {order.orderNo}
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display-tc)] text-3xl font-semibold tracking-tight md:text-4xl">
                訂單明細
              </h1>
              <p className="mt-3 text-sm text-ink-soft">{statusHint(order.status)}</p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <StatusBadge status={order.status} />
              <p className="text-xl font-medium">
                NT$ {order.totalAmount.toLocaleString("zh-TW")}
              </p>
              <p className="text-xs text-mute">
                建立 {order.createdAt}｜更新 {order.updatedAt}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-5 py-10 md:px-8 md:py-12">
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-display-tc)] text-xl">
            處理進度
          </h2>
          <OrderStatusTimeline status={order.status} />
        </div>

        <div className="border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-[family-name:var(--font-display-tc)] text-xl">
              訂購品項／規格
            </h2>
          </div>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="px-5 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-medium">{item.productName}</p>
                    <p className="mt-1 text-sm text-ink-soft">{item.specs}</p>
                    <p className="mt-2 text-sm text-mute">數量 × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    <StatusBadge status={item.status} />
                    <p className="font-medium">
                      NT$ {item.amount.toLocaleString("zh-TW")}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {order.items.map((item) => (
          <UploadPanel
            key={item.id}
            item={item}
            canUpload={canUpload(order.status) || canUpload(item.status)}
          />
        ))}

        <TransferPanel
          orderAmount={order.totalAmount}
          existing={order.transfer}
          enabled={order.status === "待付款" || order.status === "確認可印製"}
        />

        {order.shippingNote ? (
          <div className="border border-line bg-white px-5 py-5">
            <h3 className="font-[family-name:var(--font-display-tc)] text-lg">
              出貨資訊
            </h3>
            <p className="mt-2 text-sm text-ink-soft">{order.shippingNote}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
