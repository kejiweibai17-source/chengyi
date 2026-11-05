import { ORDER_STATUSES, statusIndex, type OrderStatus } from "@/data/member";

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const current = statusIndex(status);

  return (
    <ol className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {ORDER_STATUSES.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="relative">
            <div
              className={`border px-2 py-3 text-center ${
                active
                  ? "border-brand bg-brand text-white"
                  : done
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-white text-mute"
              }`}
            >
              <p className="text-[0.65rem] tracking-wider opacity-70">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-xs font-medium leading-tight">{step}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
