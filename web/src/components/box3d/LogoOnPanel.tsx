"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ArtworkRelief, ArtworkState } from "./artwork";

const MM = 0.01;

type Props = {
  panelWmm: number;
  panelHmm: number;
  boardThick: number;
  artwork: ArtworkState;
  outsideFace?: boolean;
  onChange: (patch: Partial<ArtworkState>) => void;
  setOrbitEnabled: (on: boolean) => void;
};

function applyTexLayout(
  t: THREE.Texture,
  isPattern: boolean,
  patternRepeat: number,
  rotationDeg: number,
  w: number,
  h: number,
) {
  if (isPattern) {
    const short = Math.min(w, h);
    const tile = short / Math.max(0.5, patternRepeat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(w / tile, h / tile);
    t.center.set(0.5, 0.5);
    t.rotation = (rotationDeg * Math.PI) / 180;
    t.offset.set(0, 0);
  } else {
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(1, 1);
    t.center.set(0.5, 0.5);
    t.rotation = 0;
    t.offset.set(0, 0);
  }
  t.needsUpdate = true;
}

function canvasFromImage(
  img: HTMLImageElement,
  paint: (d: Uint8ClampedArray) => void,
) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size);
  paint(data.data);
  ctx.putImageData(data, 0, 0);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

/** 從 logo 亮度／透明度做 bump（印壓起伏示意） */
function makeBumpFromImage(img: HTMLImageElement, invert: boolean) {
  return canvasFromImage(img, (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3] / 255;
      const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      let hgt = THREE.MathUtils.lerp(0.5, 0.5 + (lum - 0.5) * 0.35 + a * 0.35, a);
      if (invert) hgt = 1 - hgt;
      const v = Math.round(THREE.MathUtils.clamp(hgt, 0, 1) * 255);
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
  });
}

/** 燙金外形遮罩：不透明處＝箔 */
function makeAlphaFromImage(img: HTMLImageElement) {
  return canvasFromImage(img, (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      d[i] = d[i + 1] = d[i + 2] = a;
      d[i + 3] = 255;
    }
  });
}

function reliefLooks(relief: ArtworkRelief) {
  switch (relief) {
    case "emboss":
      return {
        useBump: true,
        invertBump: false,
        bumpScale: 0.045,
        color: "#ffffff",
        mapOpacity: 0.92,
        metalness: 0.05,
        roughness: 0.55,
        hideColorMap: false,
      };
    case "deboss":
      return {
        useBump: true,
        invertBump: true,
        bumpScale: 0.04,
        color: "#ffffff",
        mapOpacity: 0.88,
        metalness: 0.02,
        roughness: 0.7,
        hideColorMap: false,
      };
    case "foilGold":
      return {
        useBump: true,
        invertBump: false,
        bumpScale: 0.035,
        color: "#c9a227",
        mapOpacity: 1,
        metalness: 0.92,
        roughness: 0.22,
        hideColorMap: true,
      };
    case "foilSilver":
      return {
        useBump: true,
        invertBump: false,
        bumpScale: 0.035,
        color: "#b8bec6",
        mapOpacity: 1,
        metalness: 0.95,
        roughness: 0.18,
        hideColorMap: true,
      };
    default:
      return {
        useBump: false,
        invertBump: false,
        bumpScale: 0,
        color: "#ffffff",
        mapOpacity: 1,
        metalness: 0,
        roughness: 1,
        hideColorMap: false,
      };
  }
}

export function LogoOnPanel({
  panelWmm,
  panelHmm,
  boardThick,
  artwork,
  outsideFace = false,
  onChange,
  setOrbitEnabled,
}: Props) {
  const { gl } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial | THREE.MeshStandardMaterial>(
    null,
  );
  const dragPlane = useMemo(() => new THREE.Plane(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const dragging = useRef(false);

  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [bump, setBump] = useState<THREE.Texture | null>(null);
  const [alpha, setAlpha] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState(1);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);

  const w = panelWmm * MM;
  const h = panelHmm * MM;
  const thick = boardThick * MM;
  const isPattern = artwork.fillMode === "pattern";
  const look = reliefLooks(artwork.relief);
  const usePbr = artwork.relief !== "flat";

  const localClip = useMemo(
    () => [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), w),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), h),
    ],
    [w, h],
  );
  const worldClip = useMemo(
    () => localClip.map((p) => p.clone()),
    [localClip],
  );

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  useEffect(() => {
    if (!artwork.url) {
      setTex((p) => {
        p?.dispose();
        return null;
      });
      setBump((p) => {
        p?.dispose();
        return null;
      });
      setAlpha((p) => {
        p?.dispose();
        return null;
      });
      setSourceImg(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const t = new THREE.Texture(img);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
      const a = img.naturalWidth / Math.max(1, img.naturalHeight);
      setAspect(Number.isFinite(a) && a > 0 ? a : 1);
      setSourceImg(img);
      setTex((prev) => {
        prev?.dispose();
        return t;
      });
    };
    img.onerror = () => {
      if (!cancelled) {
        setTex(null);
        setSourceImg(null);
      }
    };
    img.src = artwork.url;
    return () => {
      cancelled = true;
    };
  }, [artwork.url]);

  // bump／alpha 依 relief 重算
  useEffect(() => {
    if (!sourceImg || !look.useBump) {
      setBump((p) => {
        p?.dispose();
        return null;
      });
      setAlpha((p) => {
        p?.dispose();
        return null;
      });
      return;
    }
    const b = makeBumpFromImage(sourceImg, look.invertBump);
    setBump((prev) => {
      prev?.dispose();
      return b;
    });
    if (look.hideColorMap) {
      const a = makeAlphaFromImage(sourceImg);
      setAlpha((prev) => {
        prev?.dispose();
        return a;
      });
    } else {
      setAlpha((p) => {
        p?.dispose();
        return null;
      });
    }
  }, [sourceImg, look.useBump, look.invertBump, look.hideColorMap]);

  useEffect(() => {
    if (!tex) return;
    applyTexLayout(
      tex,
      isPattern,
      artwork.patternRepeat,
      artwork.rotation,
      w,
      h,
    );
    if (bump) {
      applyTexLayout(
        bump,
        isPattern,
        artwork.patternRepeat,
        artwork.rotation,
        w,
        h,
      );
    }
    if (alpha) {
      applyTexLayout(
        alpha,
        isPattern,
        artwork.patternRepeat,
        artwork.rotation,
        w,
        h,
      );
    }
  }, [
    tex,
    bump,
    alpha,
    isPattern,
    artwork.patternRepeat,
    artwork.rotation,
    w,
    h,
  ]);

  useFrame(() => {
    if (isPattern) return;
    const parent = meshRef.current?.parent;
    const mat = matRef.current;
    if (!parent || !mat) return;
    parent.updateWorldMatrix(true, false);
    for (let i = 0; i < 4; i += 1) {
      worldClip[i].copy(localClip[i]).applyMatrix4(parent.matrixWorld);
    }
    mat.clippingPlanes = worldClip;
  });

  const base = Math.min(w, h) * artwork.scale;
  const logoW = isPattern ? w : aspect >= 1 ? base : base * aspect;
  const logoH = isPattern ? h : aspect >= 1 ? base / aspect : base;
  const x = isPattern ? w / 2 : artwork.u * w;
  const y = isPattern ? h / 2 : artwork.v * h;
  const z = outsideFace ? -0.0012 : thick + 0.0012;
  const rotZ = isPattern ? 0 : (artwork.rotation * Math.PI) / 180;
  const flipX = outsideFace ? Math.PI : 0;

  if (!artwork.url || !tex) return null;

  const toUv = (point: THREE.Vector3) => {
    onChange({
      u: THREE.MathUtils.clamp(point.x / w, 0.05, 0.95),
      v: THREE.MathUtils.clamp(point.y / h, 0.05, 0.95),
    });
  };

  return (
    <mesh
      ref={meshRef}
      position={[x, y, z]}
      rotation={[flipX, 0, outsideFace ? -rotZ : rotZ]}
      renderOrder={10}
      onPointerDown={
        isPattern
          ? undefined
          : (e) => {
              e.stopPropagation();
              dragging.current = true;
              setOrbitEnabled(false);
              const parent = meshRef.current?.parent;
              if (parent) {
                const n = new THREE.Vector3(0, 0, outsideFace ? -1 : 1)
                  .applyQuaternion(
                    parent.getWorldQuaternion(new THREE.Quaternion()),
                  )
                  .normalize();
                const p = parent.localToWorld(new THREE.Vector3(x, y, z));
                dragPlane.setFromNormalAndCoplanarPoint(n, p);
              }
              gl.domElement.style.cursor = "grabbing";
            }
      }
      onPointerUp={
        isPattern
          ? undefined
          : (e) => {
              e.stopPropagation();
              dragging.current = false;
              setOrbitEnabled(true);
              gl.domElement.style.cursor = "auto";
            }
      }
      onPointerLeave={
        isPattern
          ? undefined
          : () => {
              if (!dragging.current) return;
              dragging.current = false;
              setOrbitEnabled(true);
              gl.domElement.style.cursor = "auto";
            }
      }
      onPointerMove={
        isPattern
          ? undefined
          : (e) => {
              if (!dragging.current) return;
              e.stopPropagation();
              const parent = meshRef.current?.parent;
              if (!parent) return;
              if (e.ray.intersectPlane(dragPlane, hit)) {
                toUv(parent.worldToLocal(hit.clone()));
              }
            }
      }
      onPointerOver={
        isPattern
          ? undefined
          : () => {
              gl.domElement.style.cursor = "grab";
            }
      }
      onPointerOut={
        isPattern
          ? undefined
          : () => {
              if (!dragging.current) gl.domElement.style.cursor = "auto";
            }
      }
    >
      <planeGeometry args={[logoW, logoH]} />
      {usePbr ? (
        <meshStandardMaterial
          ref={matRef as React.RefObject<THREE.MeshStandardMaterial>}
          color={look.color}
          map={look.hideColorMap ? null : tex}
          alphaMap={look.hideColorMap ? alpha : null}
          transparent
          opacity={look.mapOpacity}
          bumpMap={bump}
          bumpScale={look.bumpScale * (outsideFace ? -1 : 1)}
          metalness={look.metalness}
          roughness={look.roughness}
          envMapIntensity={look.metalness > 0.5 ? 1.55 : 0.95}
          depthWrite={false}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
          clippingPlanes={isPattern ? [] : worldClip}
          clipShadows={!isPattern}
        />
      ) : (
        <meshBasicMaterial
          ref={matRef as React.RefObject<THREE.MeshBasicMaterial>}
          map={tex}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
          clippingPlanes={isPattern ? [] : worldClip}
          clipShadows={!isPattern}
        />
      )}
    </mesh>
  );
}
