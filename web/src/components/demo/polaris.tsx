import type { ReactNode } from "react";
import type { DemoSku } from "@/data/manuscriptFlow";

/** Shopify Polaris 風格的共用小元件（員工後台／會員前台共用） */

export const CARD =
  "rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_0_rgba(26,26,26,0.07)]";

export type Tone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "attention"
  | "critical";

const TONE: Record<Tone, string> = {
  default: "bg-[#e3e3e3] text-[#303030]",
  info: "bg-[#a4e8f2] text-[#003a5a]",
  success: "bg-[#cdfed4] text-[#014b40]",
  warning: "bg-[#ffd79d] text-[#5e4200]",
  attention: "bg-[#ffea8a] text-[#5e4200]",
  critical: "bg-[#fed1d7] text-[#8e0b21]",
};

export function Badge({
  tone = "default",
  children,
  dot,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: "empty" | "partial" | "full";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-[1px] text-[12px] font-medium leading-5 ${TONE[tone]}`}
    >
      {dot ? (
        <span
          className={`inline-block h-2 w-2 rounded-full border-[1.5px] border-current ${
            dot === "full"
              ? "bg-current"
              : dot === "partial"
                ? "bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]"
                : ""
          }`}
        />
      ) : null}
      {children}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  variant = "secondary",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "critical" | "plain";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex h-8 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const styles = {
    primary:
      "bg-[#303030] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_0_1px_#1a1a1a] hover:bg-[#1a1a1a]",
    secondary:
      "bg-white font-medium text-[#303030] shadow-[0_0_0_1px_#e3e3e3,0_1px_0_rgba(26,26,26,0.07)] hover:bg-[#fafafa]",
    critical:
      "bg-white font-medium text-[#8e1f0b] shadow-[0_0_0_1px_#e3e3e3,0_1px_0_rgba(26,26,26,0.07)] hover:bg-[#fff4f4]",
    plain: "bg-transparent px-1 font-medium text-[#005bd3] hover:underline",
  } as const;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function Card({
  title,
  badge,
  actions,
  children,
  flush,
}: {
  title?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className={CARD}>
      {title ? (
        <header className="flex items-center justify-between gap-3 px-4 pt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-[#303030]">
              {title}
            </h2>
            {badge}
          </div>
          {actions}
        </header>
      ) : null}
      <div className={flush ? "pt-3" : "p-4"}>{children}</div>
    </section>
  );
}

export function Banner({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "critical" | "success" | "warning";
  title?: string;
  children?: ReactNode;
}) {
  const t = {
    info: "bg-[#eaf4ff] text-[#00384e] border-[#a4e8f2]",
    critical: "bg-[#fff4f4] text-[#8e0b21] border-[#fed1d7]",
    success: "bg-[#f0fdf4] text-[#014b40] border-[#cdfed4]",
    warning: "bg-[#fff8e6] text-[#5e4200] border-[#ffd79d]",
  }[tone];
  return (
    <div className={`rounded-lg border px-3 py-2.5 text-[13px] ${t}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? "mt-0.5" : ""}>{children}</div> : null}
    </div>
  );
}

export function skuTone(status: DemoSku["status"]): Tone {
  switch (status) {
    case "已核准":
      return "success";
    case "待補件":
      return "critical";
    case "補件待檢":
      return "warning";
    case "待檢稿":
      return "info";
    default:
      return "default";
  }
}

export function Thumb({ code }: { code: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e3e3e3] bg-[#f7f7f7] text-[10px] font-semibold text-[#616161]">
      {code.replace("CARD-", "")}
    </div>
  );
}

export function nowLabel() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
