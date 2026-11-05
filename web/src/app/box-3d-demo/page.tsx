import type { Metadata } from "next";
import { Box3DDemo } from "@/components/box3d/Box3DDemo";

export const metadata: Metadata = {
  title: "刀模產生器｜橙益",
  description: "包裝盒 3D 預覽：尺寸、材質、組裝與開合示意試作",
};

export default function Box3DDemoPage() {
  return <Box3DDemo />;
}
