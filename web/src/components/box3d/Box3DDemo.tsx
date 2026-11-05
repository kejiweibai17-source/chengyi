"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState } from "react";
import { FlipTopMailer } from "./FlipTopMailer";
import { InsertDivider } from "./InsertDivider";
import type { MailerFinish, ProcessOverride } from "./PanelTreeView";
import {
  ARTWORK_FACE_OPTIONS,
  DEFAULT_ARTWORK,
  PATTERN_PRESETS,
  RELIEF_OPTIONS,
  type ArtworkState,
} from "./artwork";
import { DiningRoom, TABLE_TOP_Y } from "./DiningRoom";

type ShapeId = "mailer" | "insert";
type EnvId = "studio" | "dining";

/** 盒體內部單位≈公分級（mm×0.01）；室內場景為公尺 → 縮 0.1 */
const BOX_TO_METERS = 0.1;

function BoxProduct({
  shape,
  length,
  width,
  height,
  open,
  assembly,
  tint,
  finish,
  process,
  artwork,
  onArtworkChange,
  setOrbitEnabled,
}: {
  shape: ShapeId;
  length: number;
  width: number;
  height: number;
  open: number;
  assembly: number;
  tint: string;
  finish: MailerFinish;
  process: ProcessOverride;
  artwork: ArtworkState;
  onArtworkChange: (patch: Partial<ArtworkState>) => void;
  setOrbitEnabled: (on: boolean) => void;
}) {
  return (
    <>
      {shape === "mailer" && (
        <FlipTopMailer
          length={length}
          width={width}
          height={height}
          open={open}
          assembly={assembly}
          color={tint}
          finish={finish}
          process={process}
          artwork={artwork}
          onArtworkChange={onArtworkChange}
          setOrbitEnabled={setOrbitEnabled}
        />
      )}
      {shape === "insert" && (
        <InsertDivider
          length={length}
          width={width}
          height={height}
          open={open}
          assembly={assembly}
          color={tint}
          finish={finish}
          process={process}
          artwork={artwork}
          onArtworkChange={onArtworkChange}
          setOrbitEnabled={setOrbitEnabled}
        />
      )}
    </>
  );
}

function Scene({
  shape,
  env,
  length,
  width,
  height,
  open,
  assembly,
  tint,
  finish,
  process,
  artwork,
  onArtworkChange,
  orbitEnabled,
  setOrbitEnabled,
  boxPosX,
  boxPosZ,
}: {
  shape: ShapeId;
  env: EnvId;
  length: number;
  width: number;
  height: number;
  open: number;
  assembly: number;
  tint: string;
  finish: MailerFinish;
  process: ProcessOverride;
  artwork: ArtworkState;
  onArtworkChange: (patch: Partial<ArtworkState>) => void;
  orbitEnabled: boolean;
  setOrbitEnabled: (on: boolean) => void;
  /** 餐桌場景：盒在桌面的水平位移（公尺） */
  boxPosX: number;
  boxPosZ: number;
}) {
  const dining = env === "dining";
  const productY = dining ? TABLE_TOP_Y + 0.002 : 0;
  const productScale = dining ? BOX_TO_METERS : 1;
  const px = dining ? boxPosX : 0;
  const pz = dining ? boxPosZ : 0;
  const targetY = dining ? TABLE_TOP_Y + 0.08 : 0.35;

  return (
    <>
      <color attach="background" args={[dining ? "#c5c5c5" : "#dedad3"]} />
      <ambientLight intensity={dining ? 0.35 : 0.25} />
      <directionalLight
        castShadow
        position={dining ? [2.2, 4.5, 2.8] : [4.5, 8, 5.5]}
        intensity={dining ? 1.35 : 1.6}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        shadow-camera-left={dining ? -3 : -6}
        shadow-camera-right={dining ? 3 : 6}
        shadow-camera-top={dining ? 3 : 6}
        shadow-camera-bottom={dining ? -3 : -6}
      />
      <Environment
        files="/hdri/photo_studio_01_1k.hdr"
        environmentIntensity={
          dining
            ? 0.55
            : process === "foilGold" || process === "foilSilver"
              ? 1.45
              : process === "gloss"
                ? 1.2
                : 0.95
        }
      />

      {dining ? (
        <Suspense fallback={null}>
          <DiningRoom />
        </Suspense>
      ) : (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.001, 0]}
          receiveShadow
        >
          <planeGeometry args={[60, 60]} />
          <shadowMaterial opacity={0.22} />
        </mesh>
      )}

      <group position={[px, productY, pz]} scale={productScale}>
        <BoxProduct
          shape={shape}
          length={length}
          width={width}
          height={height}
          open={open}
          assembly={assembly}
          tint={tint}
          finish={finish}
          process={process}
          artwork={artwork}
          onArtworkChange={onArtworkChange}
          setOrbitEnabled={setOrbitEnabled}
        />
      </group>

      {!dining && (
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.4}
          scale={16}
          blur={2.6}
          far={6}
        />
      )}
      {dining && (
        <ContactShadows
          position={[px, TABLE_TOP_Y + 0.001, pz]}
          opacity={0.45}
          scale={2.4}
          blur={2.2}
          far={1.2}
        />
      )}

      <OrbitControls
        makeDefault
        enabled={orbitEnabled}
        minDistance={dining ? 0.45 : 2}
        maxDistance={dining ? 6 : 18}
        target={[px, targetY, pz]}
        maxPolarAngle={dining ? Math.PI * 0.49 : Math.PI / 2 - 0.02}
      />
    </>
  );
}

const SHAPES: { id: ShapeId; label: string; blurb: string }[] = [
  {
    id: "mailer",
    label: "掀蓋郵寄盒",
    blurb: "對齊 Pacdora Flip Top／Mailer 示意",
  },
  {
    id: "insert",
    label: "內襯／隔板",
    blurb: "Pacdora Insert／Divider：六角挖孔＋側翼",
  },
];

const MATERIALS: {
  id: string;
  label: string;
  group: string;
  color: string;
  finish: MailerFinish;
  process: ProcessOverride;
  /** 套在貼圖上的染色（白＝保持貼圖原色） */
  tint: string;
}[] = [
  // 紙／卡（ambientCG）
  { id: "kraft", label: "牛皮瓦楞", group: "紙卡", color: "#c9a06a", finish: "kraft", process: "none", tint: "#ffffff" },
  { id: "ivory", label: "象牙卡", group: "紙卡", color: "#f1e6cf", finish: "card", process: "none", tint: "#f4ead4" },
  { id: "black", label: "霧黑卡", group: "紙卡", color: "#2a2a2a", finish: "card", process: "none", tint: "#3a3a3a" },
  { id: "navy", label: "深藍卡", group: "紙卡", color: "#1f3a5f", finish: "card", process: "none", tint: "#2c4a78" },
  // Poly Haven 特種紙感
  { id: "linen", label: "布紋紙", group: "特種", color: "#d8cfc0", finish: "linen", process: "none", tint: "#ffffff" },
  { id: "soft", label: "軟觸皮紋", group: "特種", color: "#ece6de", finish: "leatherWhite", process: "none", tint: "#ffffff" },
  { id: "leather", label: "棕皮紋", group: "特種", color: "#6b3f2a", finish: "leatherBrown", process: "none", tint: "#ffffff" },
  { id: "velvet", label: "絲絨植絨", group: "特種", color: "#3d1f2b", finish: "velvet", process: "none", tint: "#ffffff" },
  { id: "oak", label: "白橡木紋", group: "特種", color: "#cbb892", finish: "oak", process: "none", tint: "#ffffff" },
  { id: "walnut", label: "胡桃木紋", group: "特種", color: "#4a3428", finish: "walnut", process: "none", tint: "#ffffff" },
  // 後加工示意
  { id: "matte", label: "啞膜", group: "後加工", color: "#f0ebe3", finish: "card", process: "matte", tint: "#f2ebe2" },
  { id: "gloss", label: "亮膜", group: "後加工", color: "#f5f0e8", finish: "card", process: "gloss", tint: "#f7f2ea" },
  { id: "foil-gold", label: "燙金", group: "後加工", color: "#d4af37", finish: "card", process: "foilGold", tint: "#c9a227" },
  { id: "foil-silver", label: "燙銀", group: "後加工", color: "#c0c4c8", finish: "card", process: "foilSilver", tint: "#b8bec6" },
];

type LeftTab = "shapes" | "basic" | "details" | "info" | "more";
type UnitId = "mm" | "in";

const LEFT_NAV: { id: LeftTab; label: string; icon: string }[] = [
  { id: "shapes", label: "盒型", icon: "▦" },
  { id: "basic", label: "基本", icon: "☰" },
  { id: "details", label: "細節", icon: "✎" },
  { id: "info", label: "說明", icon: "ⓘ" },
  { id: "more", label: "更多", icon: "⋯" },
];

const FILE_FORMATS = [
  { id: "ai", label: "AI 刀模", hint: "示意" },
  { id: "pdf", label: "PDF 刀模", hint: "示意" },
  { id: "dxf", label: "DXF 刀模", hint: "示意" },
  { id: "3d", label: "3D 模型", hint: "示意" },
] as const;

const YOU_GET = [
  "數秒內產生可預覽結構",
  "可檢查開合與組裝動線",
  "示意無浮水印（非正式出圖）",
  "尺寸／材質即時連動 3D",
];

function DimField({
  label,
  valueMm,
  unit,
  min,
  max,
  onChangeMm,
}: {
  label: string;
  valueMm: number;
  unit: UnitId;
  min: number;
  max: number;
  onChangeMm: (n: number) => void;
}) {
  const display =
    unit === "mm" ? valueMm : Math.round((valueMm / 25.4) * 100) / 100;
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-[#5c6570]">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-[#d8dee6] bg-white px-3 py-2.5 focus-within:border-[#3b82f6]">
        <input
          type="number"
          min={unit === "mm" ? min : Math.round((min / 25.4) * 100) / 100}
          max={unit === "mm" ? max : Math.round((max / 25.4) * 100) / 100}
          step={unit === "mm" ? 1 : 0.01}
          value={display}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            const mm = unit === "mm" ? n : n * 25.4;
            onChangeMm(Math.min(max, Math.max(min, Math.round(mm))));
          }}
          className="w-full bg-transparent text-[15px] text-[#1a1f26] outline-none"
        />
        <span className="shrink-0 text-[13px] text-[#8a93a0]">{unit}</span>
      </div>
    </label>
  );
}

export function Box3DDemo() {
  const [shape, setShape] = useState<ShapeId>("mailer");
  const [length, setLength] = useState(202);
  const [width, setWidth] = useState(315);
  const [height, setHeight] = useState(62);
  const [open, setOpen] = useState(0.15);
  const [assembly, setAssembly] = useState(1);
  const [materialId, setMaterialId] = useState("kraft");
  const [env, setEnv] = useState<EnvId>("studio");
  const [boxPosX, setBoxPosX] = useState(-0.28);
  const [boxPosZ, setBoxPosZ] = useState(0.32);
  const [artwork, setArtwork] = useState<ArtworkState>(DEFAULT_ARTWORK);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [leftTab, setLeftTab] = useState<LeftTab>("basic");
  const [unit, setUnit] = useState<UnitId>("mm");
  const [thickness, setThickness] = useState(1.5);
  const [sizeMode, setSizeMode] = useState<"manufacture" | "inner">(
    "manufacture",
  );

  const mat = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0];

  const onArtworkChange = useCallback((patch: Partial<ArtworkState>) => {
    setArtwork((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (shape === "insert" && artwork.face !== "deck") {
      setArtwork((a) => ({ ...a, face: "deck" }));
    } else if (shape === "mailer" && artwork.face === "deck") {
      setArtwork((a) => ({ ...a, face: "lid" }));
    }
  }, [shape, artwork.face]);

  useEffect(() => {
    return () => {
      if (artwork.url?.startsWith("blob:")) URL.revokeObjectURL(artwork.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const faceOptions = ARTWORK_FACE_OPTIONS.filter((f) =>
    f.forStyles.includes(shape === "insert" ? "insert" : "mailer"),
  );

  const applyShape = (s: ShapeId) => {
    setShape(s);
    if (s === "mailer") {
      setLength(202);
      setWidth(315);
      setHeight(62);
      setOpen(0);
      setAssembly(0);
      setMaterialId("kraft");
    }
    if (s === "insert") {
      setLength(201);
      setWidth(201);
      setHeight(41);
      setOpen(0);
      setAssembly(0);
      setMaterialId("ivory");
    }
  };

  const useDemoLogo = () => {
    if (artwork.url?.startsWith("blob:")) URL.revokeObjectURL(artwork.url);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = "#2c241c";
    ctx.fillRect(48, 48, 416, 416);
    ctx.fillStyle = "#e85d04";
    ctx.beginPath();
    ctx.arc(256, 200, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f7f2ea";
    ctx.font = "bold 72px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("橙益", 256, 360);
    ctx.font = "28px sans-serif";
    ctx.fillStyle = "#d9cfc0";
    ctx.fillText("PRINT", 256, 408);
    const url = canvas.toDataURL("image/png");
    setArtwork((a) => ({
      ...a,
      url,
      fileName: "demo-logo.png",
      scale: 0.45,
      u: 0.5,
      v: 0.5,
      rotation: 0,
      face: shape === "insert" ? "deck" : "lid",
    }));
    if (shape === "mailer") {
      setAssembly(1);
      setOpen(0.08);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-[#e8ecf1]">
      {/* Top bar — Packhelp-style */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#d5dbe3] bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e7ee] text-[#5c6570] hover:bg-[#f4f6f9]"
            aria-label="回首頁"
          >
            ←
          </a>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-bold text-white">
              橙
            </span>
            <span className="text-[15px] font-semibold text-[#1a1f26]">
              刀模產生器
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-lg border border-[#d5dbe3] px-3 py-2 text-[13px] text-[#3d4654] hover:bg-[#f4f6f9] sm:inline-flex"
          >
            線上設計
            <span className="text-[11px] opacity-60">↗</span>
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d5dbe3] text-[#5c6570] hover:bg-[#f4f6f9]"
            aria-label="分享"
          >
            ↗
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-[#1d4ed8]"
          >
            <span className="text-amber-300">♛</span>
            下載刀模
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left: icon rail + config */}
        <div className="flex shrink-0 border-r border-[#d5dbe3] bg-white shadow-[2px_0_12px_rgba(20,30,50,0.04)]">
          <nav className="flex w-14 flex-col items-center gap-1 border-r border-[#eef1f5] py-3">
            {LEFT_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLeftTab(item.id)}
                className={`flex w-12 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] transition ${
                  leftTab === item.id
                    ? "bg-[#e8f0fe] text-[#2563eb]"
                    : "text-[#7a8494] hover:bg-[#f4f6f9]"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <aside className="flex w-[300px] flex-col overflow-y-auto px-4 py-4">
            {leftTab === "shapes" && (
              <div className="space-y-2">
                <p className="mb-3 text-[13px] font-semibold text-[#1a1f26]">
                  選擇盒型
                </p>
                {SHAPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applyShape(s.id)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                      shape === s.id
                        ? "border-[#2563eb] bg-[#e8f0fe] text-[#1a1f26]"
                        : "border-[#e2e7ee] bg-white hover:border-[#b8c4d4]"
                    }`}
                  >
                    <span className="block text-[13px] font-medium">
                      {s.label}
                    </span>
                    <span className="text-[11px] text-[#8a93a0]">{s.blurb}</span>
                  </button>
                ))}
              </div>
            )}

            {leftTab === "basic" && (
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#1a1f26]">
                      自訂尺寸
                    </p>
                    <div className="flex rounded-lg border border-[#d8dee6] p-0.5 text-[12px]">
                      {(["mm", "in"] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUnit(u)}
                          className={`rounded-md px-2.5 py-1 ${
                            unit === u
                              ? "bg-[#2563eb] text-white"
                              : "text-[#5c6570]"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <DimField
                      label="長度 Length"
                      valueMm={length}
                      unit={unit}
                      min={80}
                      max={500}
                      onChangeMm={setLength}
                    />
                    <DimField
                      label="寬度 Width"
                      valueMm={width}
                      unit={unit}
                      min={80}
                      max={600}
                      onChangeMm={setWidth}
                    />
                    <DimField
                      label="高度 Height"
                      valueMm={height}
                      unit={unit}
                      min={20}
                      max={250}
                      onChangeMm={setHeight}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[13px] text-[#5c6570]">選擇材質</p>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-black/10"
                      style={{ background: mat.color }}
                    />
                    <select
                      value={materialId}
                      onChange={(e) => setMaterialId(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#d8dee6] bg-white py-2.5 pl-11 pr-8 text-[14px] text-[#1a1f26] outline-none focus:border-[#3b82f6]"
                    >
                      {MATERIALS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.group} · {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[13px] text-[#5c6570]">
                    自訂厚度
                    <span className="ml-1 text-[11px] text-[#8a93a0]">
                      （1.1–2 mm · 示意）
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d8dee6] text-lg text-[#5c6570] hover:bg-[#f4f6f9]"
                      onClick={() =>
                        setThickness((t) =>
                          Math.max(1.1, Math.round((t - 0.1) * 10) / 10),
                        )
                      }
                    >
                      −
                    </button>
                    <input
                      type="number"
                      step={0.1}
                      min={1.1}
                      max={2}
                      value={thickness}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n)) return;
                        setThickness(
                          Math.min(2, Math.max(1.1, Math.round(n * 10) / 10)),
                        );
                      }}
                      className="h-10 flex-1 rounded-lg border border-[#d8dee6] bg-white text-center text-[15px] outline-none focus:border-[#3b82f6]"
                    />
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d8dee6] text-lg text-[#5c6570] hover:bg-[#f4f6f9]"
                      onClick={() =>
                        setThickness((t) =>
                          Math.min(2, Math.round((t + 0.1) * 10) / 10),
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[13px] text-[#5c6570]">尺寸模式</p>
                  <select
                    value={sizeMode}
                    onChange={(e) =>
                      setSizeMode(e.target.value as "manufacture" | "inner")
                    }
                    className="w-full rounded-lg border border-[#d8dee6] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#3b82f6]"
                  >
                    <option value="manufacture">製造尺寸（外徑）</option>
                    <option value="inner">內容尺寸（內徑）</option>
                  </select>
                </div>

                {(shape === "mailer" || shape === "insert") && (
                  <div>
                    <div className="mb-1.5 flex justify-between text-[13px] text-[#5c6570]">
                      <span>組裝（攤平 → 立體）</span>
                      <span>{Math.round(assembly * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={assembly}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setAssembly(next);
                        if (next < 1) setOpen(0);
                      }}
                      className="w-full accent-[#2563eb]"
                    />
                  </div>
                )}
              </div>
            )}

            {leftTab === "details" && (
              <div className="space-y-5">
                <p className="text-[13px] font-semibold text-[#1a1f26]">
                  Logo／圖案示意
                </p>
                {(shape === "mailer" || shape === "insert") && (
                  <>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#c5ced9] bg-[#f8fafc] px-3 py-5 text-center hover:border-[#2563eb]">
                      <span className="text-[13px] text-[#1a1f26]">
                        {artwork.fileName || "點擊上傳 PNG／JPG"}
                      </span>
                      <span className="mt-1 text-[11px] text-[#8a93a0]">
                        建議透明底 · 僅示意
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (artwork.url?.startsWith("blob:")) {
                            URL.revokeObjectURL(artwork.url);
                          }
                          setArtwork((a) => ({
                            ...a,
                            url: URL.createObjectURL(file),
                            fileName: file.name,
                          }));
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={useDemoLogo}
                      className="w-full rounded-lg border border-[#e2e7ee] py-2 text-[12px] text-[#5c6570] hover:border-[#2563eb]"
                    >
                      使用示範 logo
                    </button>
                    {artwork.url && (
                      <div className="space-y-3 rounded-xl border border-[#e2e7ee] bg-[#f8fafc] p-3">
                        <div>
                          <p className="mb-1 text-[11px] text-[#8a93a0]">
                            貼在哪一面
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {faceOptions.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => onArtworkChange({ face: f.id })}
                                className={`rounded-full px-2.5 py-1 text-[11px] ${
                                  artwork.face === f.id
                                    ? "bg-[#2563eb] text-white"
                                    : "bg-white text-[#1a1f26] ring-1 ring-[#e2e7ee]"
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onArtworkChange({ fillMode: "single" })
                            }
                            className={`rounded-lg border px-2 py-2 text-left text-[11px] ${
                              artwork.fillMode === "single"
                                ? "border-[#2563eb] bg-[#e8f0fe]"
                                : "border-[#e2e7ee] bg-white"
                            }`}
                          >
                            單圖置中
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onArtworkChange({
                                fillMode: "pattern",
                                patternRepeat: artwork.patternRepeat || 3.5,
                              })
                            }
                            className={`rounded-lg border px-2 py-2 text-left text-[11px] ${
                              artwork.fillMode === "pattern"
                                ? "border-[#2563eb] bg-[#e8f0fe]"
                                : "border-[#e2e7ee] bg-white"
                            }`}
                          >
                            一鍵填滿
                          </button>
                        </div>
                        <div>
                          <p className="mb-1.5 text-[11px] text-[#8a93a0]">
                            印壓／燙金示意
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {RELIEF_OPTIONS.map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() =>
                                  onArtworkChange({ relief: r.id })
                                }
                                className={`rounded-lg border px-1 py-1.5 text-center text-[10px] ${
                                  artwork.relief === r.id
                                    ? "border-[#2563eb] bg-[#e8f0fe]"
                                    : "border-[#e2e7ee] bg-white"
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        {artwork.fillMode === "pattern" ? (
                          <>
                            <div className="flex gap-1.5">
                              {PATTERN_PRESETS.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() =>
                                    onArtworkChange({ patternRepeat: p.repeat })
                                  }
                                  className={`flex-1 rounded-full py-1 text-[11px] ${
                                    Math.abs(artwork.patternRepeat - p.repeat) <
                                    0.2
                                      ? "bg-[#2563eb] text-white"
                                      : "bg-white ring-1 ring-[#e2e7ee]"
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                            <label className="block text-[12px] text-[#5c6570]">
                              <span className="mb-1 flex justify-between">
                                <span>重複密度</span>
                                <span>×{artwork.patternRepeat.toFixed(1)}</span>
                              </span>
                              <input
                                type="range"
                                min={1.2}
                                max={10}
                                step={0.1}
                                value={artwork.patternRepeat}
                                onChange={(e) =>
                                  onArtworkChange({
                                    patternRepeat: Number(e.target.value),
                                  })
                                }
                                className="w-full accent-[#2563eb]"
                              />
                            </label>
                          </>
                        ) : (
                          <>
                            {(
                              [
                                ["左右", "u", 0.05, 0.95],
                                ["上下", "v", 0.05, 0.95],
                                ["大小", "scale", 0.12, 0.9],
                              ] as const
                            ).map(([label, key, min, max]) => (
                              <label
                                key={key}
                                className="block text-[12px] text-[#5c6570]"
                              >
                                <span className="mb-1 flex justify-between">
                                  <span>{label}</span>
                                  <span>
                                    {Math.round(artwork[key] * 100)}%
                                  </span>
                                </span>
                                <input
                                  type="range"
                                  min={min}
                                  max={max}
                                  step={0.01}
                                  value={artwork[key]}
                                  onChange={(e) =>
                                    onArtworkChange({
                                      [key]: Number(e.target.value),
                                    })
                                  }
                                  className="w-full accent-[#2563eb]"
                                />
                              </label>
                            ))}
                          </>
                        )}
                        <button
                          type="button"
                          className="w-full rounded-lg border border-[#e2e7ee] py-1.5 text-[11px] text-[#5c6570]"
                          onClick={() => {
                            if (artwork.url?.startsWith("blob:")) {
                              URL.revokeObjectURL(artwork.url);
                            }
                            setArtwork({
                              ...DEFAULT_ARTWORK,
                              face: shape === "insert" ? "deck" : "lid",
                            });
                          }}
                        >
                          移除圖案
                        </button>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <p className="mb-2 text-[13px] font-semibold text-[#1a1f26]">
                    材質示意
                  </p>
                  {(["紙卡", "特種", "後加工"] as const).map((group) => (
                    <div key={group} className="mb-3">
                      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-[#8a93a0]">
                        {group}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {MATERIALS.filter((m) => m.group === group).map(
                          (m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setMaterialId(m.id)}
                              className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-[11px] ${
                                materialId === m.id
                                  ? "border-[#2563eb] bg-[#e8f0fe]"
                                  : "border-[#e2e7ee] bg-white"
                              }`}
                            >
                              <span
                                className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                                style={{ background: m.color }}
                              />
                              {m.label}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftTab === "info" && (
              <div className="space-y-3 text-[13px] leading-relaxed text-[#5c6570]">
                <p className="font-semibold text-[#1a1f26]">說明</p>
                <p>
                  此為橙益包裝盒 3D 示意試作，版面參照常見刀模產生器操作動線；中間為即時
                  3D 預覽（非 2D 刀模展開圖）。
                </p>
                <p>
                  不含可生產刀模精度與正式下載檔。材質貼圖來自 Poly Haven／ambientCG（CC0）。
                </p>
              </div>
            )}

            {leftTab === "more" && (
              <div className="space-y-4">
                <p className="text-[13px] font-semibold text-[#1a1f26]">場景</p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "studio" as const, label: "攝影棚", blurb: "結構" },
                      {
                        id: "dining" as const,
                        label: "北歐餐桌",
                        blurb: "情境",
                      },
                    ] as const
                  ).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEnv(e.id)}
                      className={`rounded-xl border px-3 py-2 text-left ${
                        env === e.id
                          ? "border-[#2563eb] bg-[#e8f0fe]"
                          : "border-[#e2e7ee] bg-white"
                      }`}
                    >
                      <span className="block text-[13px] font-medium">
                        {e.label}
                      </span>
                      <span className="text-[11px] text-[#8a93a0]">
                        {e.blurb}
                      </span>
                    </button>
                  ))}
                </div>
                {env === "dining" && (
                  <div className="space-y-2 rounded-xl border border-[#e2e7ee] bg-[#f8fafc] p-3">
                    <p className="text-[12px] font-medium text-[#5c6570]">
                      盒子在桌上的位置
                    </p>
                    <label className="block text-[11px] text-[#5c6570]">
                      <span className="mb-1 flex justify-between">
                        <span>左右</span>
                        <span>{boxPosX.toFixed(2)} m</span>
                      </span>
                      <input
                        type="range"
                        min={-0.7}
                        max={0.7}
                        step={0.01}
                        value={boxPosX}
                        onChange={(e) => setBoxPosX(Number(e.target.value))}
                        className="w-full accent-[#2563eb]"
                      />
                    </label>
                    <label className="block text-[11px] text-[#5c6570]">
                      <span className="mb-1 flex justify-between">
                        <span>前後</span>
                        <span>{boxPosZ.toFixed(2)} m</span>
                      </span>
                      <input
                        type="range"
                        min={-0.7}
                        max={0.7}
                        step={0.01}
                        value={boxPosZ}
                        onChange={(e) => setBoxPosZ(Number(e.target.value))}
                        className="w-full accent-[#2563eb]"
                      />
                    </label>
                    <button
                      type="button"
                      className="w-full rounded-lg border border-[#e2e7ee] py-1.5 text-[11px] text-[#5c6570]"
                      onClick={() => {
                        setBoxPosX(-0.28);
                        setBoxPosZ(0.32);
                      }}
                    >
                      重設位置
                    </button>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>

        {/* Center: current 3D preview */}
        <section className="relative min-w-0 flex-1 bg-[#eef1f4]">
          <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-3 rounded-lg bg-white/90 px-3 py-2 text-[11px] text-[#5c6570] shadow-sm backdrop-blur">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-0.5 w-4 bg-emerald-500" />
              Bleed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-0.5 w-4 bg-sky-500" />
              Trim
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-0.5 w-4 bg-rose-500" />
              Crease
            </span>
            <span className="text-[#8a93a0]">
              · 3D 預覽（非 2D 刀模）
            </span>
          </div>

          <div className="absolute inset-0">
            <Canvas
              key={env}
              shadows
              gl={{ localClippingEnabled: true }}
              camera={
                env === "dining"
                  ? {
                      position: [0.85, 1.35, 1.15],
                      fov: 40,
                      near: 0.05,
                      far: 40,
                    }
                  : { position: [4.2, 3.2, 5.4], fov: 38 }
              }
            >
              <Suspense fallback={null}>
                <Scene
                  shape={shape}
                  env={env}
                  length={length}
                  width={width}
                  height={height}
                  open={open}
                  assembly={assembly}
                  tint={mat.tint}
                  finish={mat.finish}
                  process={mat.process}
                  artwork={artwork}
                  onArtworkChange={onArtworkChange}
                  orbitEnabled={orbitEnabled}
                  setOrbitEnabled={setOrbitEnabled}
                  boxPosX={boxPosX}
                  boxPosZ={boxPosZ}
                />
              </Suspense>
            </Canvas>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-[#d5dbe3] bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
              {(
                [
                  { label: "旋轉", tip: "拖曳畫面" },
                  { label: "縮放", tip: "滾輪" },
                  { label: "重設", tip: "組裝 0%" },
                ] as const
              ).map((t) => (
                <button
                  key={t.label}
                  type="button"
                  title={t.tip}
                  onClick={() => {
                    if (t.label === "重設") {
                      setAssembly(0);
                      setOpen(0);
                    }
                  }}
                  className="rounded-lg px-3 py-1.5 text-[12px] text-[#3d4654] hover:bg-[#f4f6f9]"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right: open/close + formats + you get */}
        <aside className="flex w-[280px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-[#d5dbe3] bg-[#eef1f4] p-4">
          <div className="overflow-hidden rounded-2xl border border-[#d5dbe3] bg-white shadow-sm">
            <div
              className="relative flex h-40 items-end justify-center px-4 pb-3"
              style={{
                background: `linear-gradient(160deg, ${mat.color}55, #f4f6f9 55%)`,
              }}
            >
              <div
                className="h-24 w-[70%] rounded-md shadow-md transition-transform"
                style={{
                  background: mat.color,
                  transform: `perspective(420px) rotateX(${12 - open * 8}deg) rotateY(-18deg) scale(${0.92 + assembly * 0.08})`,
                  boxShadow: "8px 14px 28px rgba(30,40,60,0.22)",
                }}
              />
            </div>
            <div className="border-t border-[#eef1f5] px-3 py-3">
              <div className="flex items-center gap-2 text-[11px] text-[#5c6570]">
                <span className="w-9 shrink-0">Open</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={1 - open}
                  onChange={(e) => setOpen(1 - Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#d8dee6] accent-[#2563eb]"
                  aria-label="Open Close"
                />
                <span className="w-9 shrink-0 text-right">Close</span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold text-[#1a1f26]">
              檔案格式
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FILE_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="rounded-xl border border-[#d5dbe3] bg-white px-2 py-3 text-center shadow-sm hover:border-[#2563eb]"
                >
                  <span className="block text-[12px] font-medium text-[#1a1f26]">
                    {f.label}
                  </span>
                  <span className="text-[10px] text-[#8a93a0]">{f.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#d5dbe3] bg-white p-4 shadow-sm">
            <p className="mb-2 text-[13px] font-semibold text-[#1a1f26]">
              你會得到
            </p>
            <ul className="space-y-2">
              {YOU_GET.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-[12px] leading-snug text-[#5c6570]"
                >
                  <span className="mt-0.5 text-[#2563eb]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] leading-relaxed text-[#8a93a0]">
            {shape === "insert"
              ? "預設約 201×201×41 mm。"
              : "預設約 315×202×62 mm。"}
            此為外觀示意，不含刀模下載與可生產精度。
          </p>
        </aside>
      </div>
    </div>
  );
}
