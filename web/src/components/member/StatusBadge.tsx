import type { OrderStatus } from "@/data/member";

const styles: Record<OrderStatus, string> = {
  待上傳: "border-ink/20 bg-paper-deep text-ink-soft",
  待檢稿: "border-ink/30 bg-ink text-paper",
  待補件: "border-brand/40 bg-brand/10 text-brand-deep",
  確認可印製: "border-ink/25 bg-white text-ink",
  待付款: "border-brand bg-brand text-white",
  已收款: "border-ink/20 bg-paper-deep text-ink",
  印製中: "border-ink/40 bg-ink-soft text-paper",
  已出貨: "border-ink/15 bg-white text-mute",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-xs tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}
