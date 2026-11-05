/** 第一階段示意：客戶 logo／圖案貼在指定盒面 */

export type ArtworkFace = "lid" | "front" | "deck";

/** 單圖置中 vs 重複圖案填滿 */
export type ArtworkFillMode = "single" | "pattern";

/**
 * 印壓／後加工示意（非真實壓模）
 * - flat：平面印刷
 * - emboss：浮凸
 * - deboss：壓凹
 * - foilGold／foilSilver：燙金／燙銀壓印感
 */
export type ArtworkRelief =
  | "flat"
  | "emboss"
  | "deboss"
  | "foilGold"
  | "foilSilver";

export type ArtworkState = {
  /** blob: 或 https URL；null＝尚未上傳 */
  url: string | null;
  fileName: string | null;
  face: ArtworkFace;
  fillMode: ArtworkFillMode;
  relief: ArtworkRelief;
  /** 面板局部座標，0–1（0.5＝置中）；僅 single */
  u: number;
  v: number;
  /** 相對面板較短邊的比例，約 0.15–0.9；僅 single */
  scale: number;
  /** 度；兩種模式都可用 */
  rotation: number;
  /**
   * 圖案模式：沿較短邊重複次數（約 1.5–10）
   * 數字越大圖案越小、越密
   */
  patternRepeat: number;
};

export const DEFAULT_ARTWORK: ArtworkState = {
  url: null,
  fileName: null,
  face: "lid",
  fillMode: "single",
  relief: "flat",
  u: 0.5,
  v: 0.55,
  scale: 0.42,
  rotation: 0,
  patternRepeat: 3,
};

export const RELIEF_OPTIONS: {
  id: ArtworkRelief;
  label: string;
  blurb: string;
}[] = [
  { id: "flat", label: "平面印", blurb: "一般印刷" },
  { id: "emboss", label: "浮凸", blurb: "印壓突起" },
  { id: "deboss", label: "壓凹", blurb: "印壓凹陷" },
  { id: "foilGold", label: "燙金壓", blurb: "金箔＋壓感" },
  { id: "foilSilver", label: "燙銀壓", blurb: "銀箔＋壓感" },
];

export const ARTWORK_FACE_OPTIONS: {
  id: ArtworkFace;
  label: string;
  forStyles: Array<"mailer" | "insert">;
}[] = [
  { id: "lid", label: "蓋外面", forStyles: ["mailer"] },
  { id: "front", label: "前牆", forStyles: ["mailer"] },
  { id: "deck", label: "頂板", forStyles: ["insert"] },
];

/** 一鍵填滿預設密度 */
export const PATTERN_PRESETS: { id: string; label: string; repeat: number }[] = [
  { id: "sparse", label: "疏", repeat: 2 },
  { id: "medium", label: "中", repeat: 3.5 },
  { id: "dense", label: "密", repeat: 6 },
];

/** 面板名稱 → 可貼圖面 */
export function panelArtworkFace(name: string): ArtworkFace | null {
  if (name === "Lid") return "lid";
  if (name === "Front") return "front";
  if (name === "Deck") return "deck";
  return null;
}
