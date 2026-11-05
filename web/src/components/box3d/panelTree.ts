/**
 * 參數化面板樹 — 飛機盒（掀蓋郵寄盒）
 *
 * 座標約定（每個面板的局部座標）：
 *  - 面板佔 x∈[0,w]、y∈[0,h]，厚度沿 +z
 *  - 鉸鏈折線一律是子片的 y=0 那條邊
 *  - 折角 0 = 與父片共面（攤平刀模）；正角 = 往「根面板 +z」那側立起
 *  - 底板 +z 朝上；牆立起後，牆的 +z 皆指向盒內側
 */

export type HingeEdge = "top" | "bottom" | "left" | "right";

export type PanelRole =
  | "base"
  | "wall"
  | "double"
  | "lid"
  | "ear"
  | "tuck"
  | "wing"
  | "bridge"
  | "deck";

export type PanelOutline =
  | "rect"
  | "tuck"
  | "dust"
  /** 內托頂板：六角＋花瓣挖孔 */
  | "deck-hex"
  /** 側翼：圓孔 */
  | "wing-circle";

export type PanelNode = {
  id: string;
  name: string;
  role: PanelRole;
  /** 沿局部 x 的尺寸（mm） */
  w: number;
  /** 沿局部 y 的尺寸（mm） */
  h: number;
  /** 組裝後的折角（rad），僅供參考／攤平動畫用 */
  foldAngle: number;
  parentEdge?: HingeEdge;
  parentOffset?: number;
  /** 折疊時把鉸鏈沿 +z 抬高（雙壁貼合用），mm */
  zLift?: number;
  outline: PanelOutline;
  children: PanelNode[];
};

/** 瓦楞厚度示意（mm） */
export const BOARD_MM = 1.5;

/** 蓋「打開」時相對背牆的角度（負＝向後仰） */
export const LID_OPEN_ANGLE = -Math.PI * 0.34;
export const LID_CLOSED_ANGLE = Math.PI / 2;

let _uid = 0;

function make(
  name: string,
  role: PanelRole,
  w: number,
  h: number,
  foldAngle: number,
  outline: PanelOutline = "rect",
  zLift = 0,
): PanelNode {
  _uid += 1;
  return {
    id: `${role}-${_uid}`,
    name,
    role,
    w,
    h,
    foldAngle,
    outline,
    zLift,
    children: [],
  };
}

function attach(
  parent: PanelNode,
  edge: HingeEdge,
  offset: number,
  child: PanelNode,
): PanelNode {
  child.parentEdge = edge;
  child.parentOffset = offset;
  parent.children.push(child);
  return child;
}

export function buildFlipTopMailer(dims: {
  length: number; // 前後 L
  width: number; // 左右 W
  height: number; // 高 H
}): PanelNode {
  _uid = 0;
  const { length: L, width: W, height: H } = dims;
  const T = BOARD_MM;

  const base = make("Bottom", "base", W, L, 0);

  const back = attach(base, "top", 0, make("Back", "wall", W, H, Math.PI / 2));
  attach(base, "bottom", 0, make("Front", "wall", W, H, Math.PI / 2));
  const left = attach(base, "left", 0, make("Left", "wall", L, H, Math.PI / 2));
  const right = attach(
    base,
    "right",
    0,
    make("Right", "wall", L, H, Math.PI / 2),
  );

  // 雙壁內折片（180° 貼回牆內側）
  const dW = (L - 4 * T) * 0.96;
  attach(
    left,
    "top",
    (L - dW) / 2,
    make("Left Double", "double", dW, H * 0.9, Math.PI, "rect", 2 * T),
  );
  attach(
    right,
    "top",
    (L - dW) / 2,
    make("Right Double", "double", dW, H * 0.9, Math.PI, "rect", 2 * T),
  );

  // 蓋：掛背牆頂；左右縮 2T、前後縮 3T，讓耳片與插舌能收進盒內
  const lidW = W - 4 * T;
  const lidH = L - 3 * T;
  const lid = attach(
    back,
    "top",
    2 * T,
    make("Lid", "lid", lidW, lidH, LID_CLOSED_ANGLE),
  );

  // 插舌
  const tuckW = lidW * 0.88;
  attach(
    lid,
    "top",
    (lidW - tuckW) / 2,
    make(
      "Tuck",
      "tuck",
      tuckW,
      Math.max(26, H * 0.72),
      Math.PI / 2,
      "tuck",
    ),
  );

  // 蓋耳：沿蓋左右緣；w＝沿邊長度、h＝往外伸出（折下後變深度）
  const earLen = lidH * 0.72;
  const earDepth = Math.max(22, H * 0.82);
  attach(
    lid,
    "left",
    (lidH - earLen) / 2,
    make("Left Ear", "ear", earLen, earDepth, Math.PI / 2, "dust"),
  );
  attach(
    lid,
    "right",
    (lidH - earLen) / 2,
    make("Right Ear", "ear", earLen, earDepth, Math.PI / 2, "dust"),
  );

  return base;
}

/**
 * 內襯／隔板（Insert／Divider）— 對照 Pacdora inserts-dividers
 *
 * 結構（示意）：頂板（六角＋花瓣挖孔）＋四面牆立起成托盤，
 * 前牆上緣接「前橋」、背牆上緣接「後插舌」，兩者往盒內折平當鎖片；
 * 前橋左右再接側翼（左側有圓孔），折下貼在側牆內側。
 *
 * 組裝順序（與 jointAngle 對應）：
 *   側翼立起 → 前橋／後插舌立起 → 四牆一起立起（帶著橋與翼翻進盒內）
 */
export function buildInsertDivider(dims: {
  length: number;
  width: number;
  height: number;
}): PanelNode {
  _uid = 0;
  const { length: L, width: W, height: H } = dims;
  const T = BOARD_MM;

  // 頂板（承物面，六角花瓣孔）
  const deck = make("Deck", "deck", W, L, 0, "deck-hex");

  // 四牆：往上立（組裝後成托盤深）
  const back = attach(
    deck,
    "top",
    0,
    make("Back Wall", "wall", W, H, Math.PI / 2),
  );
  const front = attach(
    deck,
    "bottom",
    0,
    make("Front Wall", "wall", W, H, Math.PI / 2),
  );
  attach(deck, "left", 0, make("Left Wall", "wall", L, H, Math.PI / 2));
  attach(deck, "right", 0, make("Right Wall", "wall", L, H, Math.PI / 2));

  // 前橋：掛前牆上緣，折進盒內蓋在牆頂；左右縮 2T 才進得了側牆之間
  const bridgeD = L * 0.36;
  const bridge = attach(
    front,
    "top",
    2 * T,
    make("Bridge", "bridge", W - 4 * T, bridgeD, Math.PI / 2),
  );

  // 側翼：掛前橋左右緣，折下貼側牆內側；高度不超過內牆高、也不撞到頂板
  const wingH = Math.max(8, Math.min(H - 3 * T, L * 0.3));
  attach(
    bridge,
    "left",
    0,
    make("Left Wing", "wing", bridgeD, wingH, Math.PI / 2, "wing-circle"),
  );
  attach(
    bridge,
    "right",
    0,
    make("Right Wing", "wing", bridgeD, wingH, Math.PI / 2, "rect"),
  );

  // 後插舌：掛背牆上緣，折進盒內；與前橋之間留空隙
  attach(
    back,
    "top",
    W * 0.15,
    make("Back Tuck", "tuck", W * 0.7, L * 0.26, Math.PI / 2, "tuck"),
  );

  return deck;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type BoxStyleId = "mailer" | "insert";

/**
 * 回傳某一片目前的折角（rad）
 * assembly：0＝攤平刀模 → 1＝組好
 * open：mailer＝蓋開合；insert＝側翼／底橋收合程度
 */
export function jointAngle(
  node: PanelNode,
  open: number,
  assembly: number,
  style: BoxStyleId = "mailer",
): number {
  const a = clamp01(assembly);
  const close = 1 - clamp01(open);

  if (style === "insert") {
    // 前橋／後插舌：Open 時往上翹起（約 18%），Close 時折平；僅組裝完成後才生效
    const lockOpen = smooth(open) * smooth((a - 0.85) / 0.15);
    const lockFactor = 1 - 0.82 * lockOpen;
    switch (node.role) {
      case "wing":
        // 1) 側翼先立起（橋還攤平）
        return smooth(a / 0.2) * node.foldAngle;
      case "bridge":
      case "tuck":
        // 2) 橋／插舌立起（牆還攤平）
        return smooth((a - 0.15) / 0.25) * node.foldAngle * lockFactor;
      case "wall":
        // 3) 四牆一起立起，把橋與翼翻進盒內
        return smooth((a - 0.35) / 0.5) * node.foldAngle;
      default:
        return 0;
    }
  }

  // 蓋目前角度（0＝與背牆同平面向上，π/2＝水平蓋好）
  const lidAngle = lerp(LID_OPEN_ANGLE, LID_CLOSED_ANGLE, smooth(close));

  /**
   * 插舌：蓋還在半開時若維持與蓋垂直，繞背牆鉸鏈轉動時會掃出前牆外面（穿透）。
   * 因此讓插舌在蓋接近水平前，一直保持「世界座標約垂直向下」（相對蓋角 = π − 蓋角），
   * 蓋完全合上時剛好是 π/2。
   */
  const tuckAngle = () => {
    const s = smooth(lidAngle / (Math.PI * 0.35));
    const f = Math.min(Math.PI - lidAngle, Math.PI * 0.92);
    return lerp(0, f, s);
  };
  // 蓋耳：很早就折到定位（折在蓋左右緣、貼在雙壁內側），避免半折時戳進側牆
  const earFold = (assemblyGate: number) =>
    smooth(close / 0.18) * assemblyGate * node.foldAngle;

  if (a < 0.999) {
    switch (node.role) {
      case "wall":
        return smooth(a / 0.5) * node.foldAngle;
      case "double":
        return smooth((a - 0.4) / 0.3) * node.foldAngle;
      case "lid":
        // 組裝的收尾要往盒內合上；不能使用 Open 狀態的負角度，
        // 否則蓋片會沿背牆往盒外折，看起來像收錯邊。
        return smooth((a - 0.6) / 0.4) * LID_CLOSED_ANGLE;
      case "ear":
        return earFold(smooth((a - 0.88) / 0.12));
      case "tuck":
        return node.foldAngle * smooth((a - 0.88) / 0.12);
      default:
        return 0;
    }
  }

  switch (node.role) {
    case "wall":
    case "double":
      return node.foldAngle;
    case "lid":
      return lidAngle;
    case "ear":
      return earFold(1);
    case "tuck":
      return tuckAngle();
    default:
      return 0;
  }
}

/** 折角越大，zLift 越完整（雙壁貼合） */
export function liftAmount(node: PanelNode, angle: number): number {
  if (!node.zLift) return 0;
  const ratio = Math.min(1, Math.abs(angle) / Math.abs(node.foldAngle || 1));
  return node.zLift * ratio;
}
