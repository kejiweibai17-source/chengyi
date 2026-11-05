"use client";

import { useTexture } from "@react-three/drei";
import { useLayoutEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import {
  BOARD_MM,
  type BoxStyleId,
  type HingeEdge,
  type PanelNode,
  buildFlipTopMailer,
  buildInsertDivider,
  jointAngle,
  liftAmount,
} from "./panelTree";
import {
  panelArtworkFace,
  type ArtworkState,
} from "./artwork";
import { LogoOnPanel } from "./LogoOnPanel";

const MM = 0.01;
const THICK = BOARD_MM * MM;

function addPolygonHole(
  shape: THREE.Shape,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation = 0,
) {
  const hole = new THREE.Path();
  for (let i = 0; i <= sides; i += 1) {
    const a = rotation + (i / sides) * Math.PI * 2;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  shape.holes.push(hole);
}

function makeOutlineShape(
  w: number,
  h: number,
  kind: PanelNode["outline"],
): THREE.Shape {
  const s = new THREE.Shape();
  if (kind === "tuck") {
    const inset = w * 0.045;
    const r = Math.min(w, h) * 0.12;
    s.moveTo(inset, 0);
    s.lineTo(w - inset, 0);
    s.lineTo(w, h * 0.55);
    s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(r, h);
    s.quadraticCurveTo(0, h, 0, h * 0.55);
    s.lineTo(inset, 0);
  } else if (kind === "dust") {
    const r = Math.min(w, h) * 0.22;
    s.moveTo(0, 0);
    s.lineTo(w, 0);
    s.lineTo(w, h - r);
    s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(w * 0.22, h);
    s.quadraticCurveTo(0, h, 0, h - r * 1.2);
    s.lineTo(0, 0);
  } else if (kind === "deck-hex") {
    s.moveTo(0, 0);
    s.lineTo(w, 0);
    s.lineTo(w, h);
    s.lineTo(0, h);
    s.closePath();
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.22;
    // 中央六角孔
    addPolygonHole(s, cx, cy, R, 6, Math.PI / 6);
    // 六片花瓣／梯形槽（示意，非精確刀模）
    for (let i = 0; i < 6; i += 1) {
      const a = Math.PI / 6 + (i / 6) * Math.PI * 2;
      const petal = new THREE.Path();
      const r0 = R * 1.15;
      const r1 = R * 1.85;
      const half = 0.22;
      const a0 = a - half;
      const a1 = a + half;
      petal.moveTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0);
      petal.lineTo(cx + Math.cos(a0) * r1, cy + Math.sin(a0) * r1);
      petal.lineTo(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1);
      petal.lineTo(cx + Math.cos(a1) * r0, cy + Math.sin(a1) * r0);
      petal.closePath();
      s.holes.push(petal);
    }
  } else if (kind === "wing-circle") {
    s.moveTo(0, 0);
    s.lineTo(w, 0);
    s.lineTo(w, h);
    s.lineTo(0, h);
    s.closePath();
    const hole = new THREE.Path();
    const r = Math.min(w, h) * 0.22;
    hole.absarc(w * 0.45, h * 0.5, r, 0, Math.PI * 2, false);
    s.holes.push(hole);
  } else {
    s.moveTo(0, 0);
    s.lineTo(w, 0);
    s.lineTo(w, h);
    s.lineTo(0, h);
    s.closePath();
  }
  return s;
}

type Maps = {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
};

type FinishLook = {
  metalness: number;
  roughness: number;
  envMapIntensity: number;
  normalScale: number;
  /** 亮膜／局部光澤 */
  clearcoat?: number;
  clearcoatRoughness?: number;
};

function PanelMesh({
  node,
  maps,
  color,
  look,
}: {
  node: PanelNode;
  maps: Maps;
  color: string;
  look: FinishLook;
}) {
  const w = node.w * MM;
  const h = node.h * MM;

  const geom = useMemo(() => {
    const shape = makeOutlineShape(w, h, node.outline);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: THICK,
      bevelEnabled: true,
      bevelThickness: THICK * 0.1,
      bevelSize: THICK * 0.08,
      bevelSegments: 1,
      curveSegments: 12,
    });
    g.computeVertexNormals();
    return g;
  }, [w, h, node.outline]);

  const faceMat = useMemo(() => {
    const isFoil = look.metalness >= 0.85;
    const common = {
      color,
      // 燙金／燙銀：關掉紙紋 albedo，只留微弱法線，才會有金屬反射
      map: isFoil ? null : maps.map,
      normalMap: maps.normalMap,
      roughnessMap: isFoil ? null : maps.roughnessMap,
      roughness: look.roughness,
      metalness: look.metalness,
      envMapIntensity: look.envMapIntensity,
      normalScale: new THREE.Vector2(look.normalScale, look.normalScale),
      side: THREE.DoubleSide,
    };
    if (look.clearcoat && look.clearcoat > 0) {
      return new THREE.MeshPhysicalMaterial({
        ...common,
        clearcoat: look.clearcoat,
        clearcoatRoughness: look.clearcoatRoughness ?? 0.2,
      });
    }
    return new THREE.MeshStandardMaterial(common);
  }, [color, maps, look]);

  // 紙板切口：偏淡、粗糙（模擬斷面）
  const edgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).lerp(new THREE.Color("#efe1c2"), 0.55),
        roughness: 0.95,
        metalness: Math.min(0.15, look.metalness * 0.2),
        envMapIntensity: 0.45,
      }),
    [color, look.metalness],
  );

  // 面板輪廓線：讓攤平刀模與折線一目了然
  const edges = useMemo(() => new THREE.EdgesGeometry(geom, 35), [geom]);

  return (
    <group>
      <mesh
        geometry={geom}
        material={[faceMat, edgeMat]}
        castShadow
        receiveShadow
      />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#4a3820" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

/**
 * 鉸鏈（已逐邊推導）：
 *  - top：子片往父 +y 延伸，繞父 x 軸折
 *  - bottom：子片往父 −y 延伸，先 Rz(π) 再繞父 x 軸折（角取負）
 *  - right：子片往父 +x 延伸，先 Rz(−π/2) 再繞父 y 軸折（角取負）
 *  - left ：子片往父 −x 延伸，先 Rz(+π/2) 再繞父 y 軸折
 * 以上正角皆往父面板 +z 立起
 */
function HingeGroup({
  edge,
  parentW,
  parentH,
  childW,
  offset,
  angle,
  lift,
  children,
}: {
  edge: HingeEdge;
  parentW: number;
  parentH: number;
  childW: number;
  offset: number;
  angle: number;
  lift: number;
  children: ReactNode;
}) {
  const pW = parentW * MM;
  const pH = parentH * MM;
  const cW = childW * MM;
  const o = offset * MM;
  const z = lift * MM;

  if (edge === "top") {
    return (
      <group position={[o, pH, z]} rotation={[angle, 0, 0]}>
        {children}
      </group>
    );
  }
  if (edge === "bottom") {
    return (
      <group position={[o + cW, 0, z]} rotation={[-angle, 0, 0]}>
        <group rotation={[0, 0, Math.PI]}>{children}</group>
      </group>
    );
  }
  if (edge === "right") {
    return (
      <group position={[pW, o + cW, z]} rotation={[0, -angle, 0]}>
        <group rotation={[0, 0, -Math.PI / 2]}>{children}</group>
      </group>
    );
  }
  return (
    <group position={[0, o, z]} rotation={[0, angle, 0]}>
      <group rotation={[0, 0, Math.PI / 2]}>{children}</group>
    </group>
  );
}

function PanelBranch({
  node,
  open,
  assembly,
  style,
  maps,
  color,
  look,
  artwork,
  onArtworkChange,
  setOrbitEnabled,
}: {
  node: PanelNode;
  open: number;
  assembly: number;
  style: BoxStyleId;
  maps: Maps;
  color: string;
  look: FinishLook;
  artwork?: ArtworkState | null;
  onArtworkChange?: (patch: Partial<ArtworkState>) => void;
  setOrbitEnabled?: (on: boolean) => void;
}) {
  const face = panelArtworkFace(node.name);
  const showLogo =
    artwork?.url &&
    face &&
    artwork.face === face &&
    onArtworkChange &&
    setOrbitEnabled;

  return (
    <group>
      <PanelMesh node={node} maps={maps} color={color} look={look} />
      {showLogo && (
        <LogoOnPanel
          panelWmm={node.w}
          panelHmm={node.h}
          boardThick={BOARD_MM}
          artwork={artwork}
          // 蓋／前牆：貼外側（−z），避免 logo 出現在盒內
          // 內托頂板：貼 +z（承物面朝上）
          outsideFace={face === "front" || face === "lid"}
          onChange={onArtworkChange}
          setOrbitEnabled={setOrbitEnabled}
        />
      )}
      {node.children.map((child) => {
        const angle = jointAngle(child, open, assembly, style);
        return (
          <HingeGroup
            key={child.id}
            edge={child.parentEdge ?? "top"}
            parentW={node.w}
            parentH={node.h}
            childW={child.w}
            offset={child.parentOffset ?? 0}
            angle={angle}
            lift={liftAmount(child, angle)}
          >
            <PanelBranch
              node={child}
              open={open}
              assembly={assembly}
              style={style}
              maps={maps}
              color={color}
              look={look}
              artwork={artwork}
              onArtworkChange={onArtworkChange}
              setOrbitEnabled={setOrbitEnabled}
            />
          </HingeGroup>
        );
      })}
    </group>
  );
}

/** 貼圖組：ambientCG 紙板＋Poly Haven 布／皮／木（皆 CC0） */
const TEXTURE_SETS = {
  kraft: [
    "/textures/Cardboard002_1K-JPG_Color.jpg",
    "/textures/Cardboard002_1K-JPG_NormalGL.jpg",
    "/textures/Cardboard002_1K-JPG_Roughness.jpg",
  ],
  card: [
    "/textures/Paper001_1K-JPG_Color.jpg",
    "/textures/Paper001_1K-JPG_NormalGL.jpg",
    "/textures/Paper001_1K-JPG_Roughness.jpg",
  ],
  linen: [
    "/textures/rough_linen/rough_linen_diff_1k.jpg",
    "/textures/rough_linen/rough_linen_nor_gl_1k.jpg",
    "/textures/rough_linen/rough_linen_rough_1k.jpg",
  ],
  leatherWhite: [
    "/textures/leather_white/leather_white_diff_1k.jpg",
    "/textures/leather_white/leather_white_nor_gl_1k.jpg",
    "/textures/leather_white/leather_white_rough_1k.jpg",
  ],
  leatherBrown: [
    "/textures/brown_leather/brown_leather_diff_1k.jpg",
    "/textures/brown_leather/brown_leather_nor_gl_1k.jpg",
    "/textures/brown_leather/brown_leather_rough_1k.jpg",
  ],
  velvet: [
    "/textures/velour_velvet/velour_velvet_diff_1k.jpg",
    "/textures/velour_velvet/velour_velvet_nor_gl_1k.jpg",
    "/textures/velour_velvet/velour_velvet_rough_1k.jpg",
  ],
  oak: [
    "/textures/white_oak_veneer/white_oak_veneer_diff_1k.jpg",
    "/textures/white_oak_veneer/white_oak_veneer_nor_gl_1k.jpg",
    "/textures/white_oak_veneer/white_oak_veneer_rough_1k.jpg",
  ],
  walnut: [
    "/textures/smoked_walnut_veneer/smoked_walnut_veneer_diff_1k.jpg",
    "/textures/smoked_walnut_veneer/smoked_walnut_veneer_nor_gl_1k.jpg",
    "/textures/smoked_walnut_veneer/smoked_walnut_veneer_rough_1k.jpg",
  ],
} as const;

export type MailerFinish = keyof typeof TEXTURE_SETS;

const FINISH_LOOK: Record<MailerFinish, FinishLook> = {
  kraft: {
    metalness: 0,
    roughness: 1,
    envMapIntensity: 0.85,
    normalScale: 0.85,
  },
  card: {
    metalness: 0,
    roughness: 0.92,
    envMapIntensity: 0.95,
    normalScale: 0.55,
  },
  linen: {
    metalness: 0,
    roughness: 0.95,
    envMapIntensity: 0.8,
    normalScale: 1.1,
  },
  leatherWhite: {
    metalness: 0.04,
    roughness: 0.72,
    envMapIntensity: 1.05,
    normalScale: 0.9,
  },
  leatherBrown: {
    metalness: 0.06,
    roughness: 0.68,
    envMapIntensity: 1.1,
    normalScale: 1.0,
  },
  velvet: {
    metalness: 0,
    roughness: 1,
    envMapIntensity: 0.55,
    normalScale: 1.25,
  },
  oak: {
    metalness: 0.02,
    roughness: 0.55,
    envMapIntensity: 1.15,
    normalScale: 0.7,
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
  },
  walnut: {
    metalness: 0.03,
    roughness: 0.5,
    envMapIntensity: 1.2,
    normalScale: 0.65,
    clearcoat: 0.3,
    clearcoatRoughness: 0.28,
  },
};

/** 後加工覆寫（燙金／亮膜等）：仍用 card 貼圖當底紋 */
export type ProcessOverride = "none" | "matte" | "gloss" | "foilGold" | "foilSilver";

const PROCESS_LOOK: Record<Exclude<ProcessOverride, "none">, FinishLook> = {
  matte: {
    metalness: 0,
    roughness: 1,
    envMapIntensity: 0.55,
    normalScale: 0.35,
  },
  gloss: {
    metalness: 0.02,
    roughness: 0.28,
    envMapIntensity: 1.35,
    normalScale: 0.35,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
  },
  foilGold: {
    metalness: 0.92,
    roughness: 0.22,
    envMapIntensity: 1.6,
    normalScale: 0.25,
  },
  foilSilver: {
    metalness: 0.95,
    roughness: 0.18,
    envMapIntensity: 1.7,
    normalScale: 0.22,
  },
};

const REPEAT_BY_FINISH: Partial<Record<MailerFinish, number>> = {
  kraft: 1.25,
  card: 2.2,
  linen: 1.8,
  leatherWhite: 1.6,
  leatherBrown: 1.6,
  velvet: 2.0,
  oak: 1.1,
  walnut: 1.1,
};

function PanelTreeBox({
  style,
  length,
  width,
  height,
  open,
  assembly = 1,
  color = "#ffffff",
  finish = "kraft",
  process = "none",
  artwork = null,
  onArtworkChange,
  setOrbitEnabled,
}: {
  style: BoxStyleId;
  length: number;
  width: number;
  height: number;
  open: number;
  assembly?: number;
  color?: string;
  finish?: MailerFinish;
  process?: ProcessOverride;
  artwork?: ArtworkState | null;
  onArtworkChange?: (patch: Partial<ArtworkState>) => void;
  setOrbitEnabled?: (on: boolean) => void;
}) {
  const tree = useMemo(
    () =>
      style === "insert"
        ? buildInsertDivider({ length, width, height })
        : buildFlipTopMailer({ length, width, height }),
    [style, length, width, height],
  );

  // 燙金／亮膜仍用卡紙底紋；其餘用選定貼圖
  const texFinish: MailerFinish =
    process === "foilGold" || process === "foilSilver" || process === "gloss" || process === "matte"
      ? "card"
      : finish;

  const [map, normalMap, roughnessMap] = useTexture([...TEXTURE_SETS[texFinish]]);

  useLayoutEffect(() => {
    const rep = REPEAT_BY_FINISH[texFinish] ?? 1.4;
    for (const t of [map, normalMap, roughnessMap]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 16;
      t.colorSpace = t === map ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.repeat.set(rep, rep);
      t.needsUpdate = true;
    }
  }, [map, normalMap, roughnessMap, texFinish]);

  const maps = useMemo(
    () => ({ map, normalMap, roughnessMap }),
    [map, normalMap, roughnessMap],
  );

  const look = useMemo(() => {
    if (process !== "none") return PROCESS_LOOK[process];
    return FINISH_LOOK[finish];
  }, [finish, process]);

  const W = width * MM;
  const L = length * MM;
  const y = style === "insert" ? height * MM * 0.02 : 0;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[-W / 2, y, L / 2]}>
      <PanelBranch
        node={tree}
        open={open}
        assembly={assembly}
        style={style}
        maps={maps}
        color={color}
        look={look}
        artwork={artwork}
        onArtworkChange={onArtworkChange}
        setOrbitEnabled={setOrbitEnabled}
      />
    </group>
  );
}

export function FlipTopMailerPanelTree(
  props: Omit<Parameters<typeof PanelTreeBox>[0], "style">,
) {
  return <PanelTreeBox {...props} style="mailer" />;
}

export function InsertDividerPanelTree(
  props: Omit<Parameters<typeof PanelTreeBox>[0], "style">,
) {
  return <PanelTreeBox {...props} style="insert" />;
}
