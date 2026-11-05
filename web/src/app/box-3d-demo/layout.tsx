export default function Box3DDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh overflow-hidden bg-[#eef1f4] text-[#1a1f26]">
      {children}
    </div>
  );
}
