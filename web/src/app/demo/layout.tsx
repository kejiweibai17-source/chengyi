export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh bg-[#f1f1f1] text-[#303030]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans TC", sans-serif',
      }}
    >
      {children}
    </div>
  );
}
