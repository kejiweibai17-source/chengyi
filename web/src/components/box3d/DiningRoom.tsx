"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";

/** CGTrader Free Dining Set Scandinavian（轉成 glb） */
export const DINING_GLB = "/scenes/dining-scandinavian/dining-set.glb";

/** 場景為公尺制；桌面約 0.75 m */
export const TABLE_TOP_Y = 0.749;

type Props = {
  /** 整場景縮放（預設 1＝真實公尺） */
  scale?: number;
};

export function DiningRoom({ scale = 1 }: Props) {
  const { scene } = useGLTF(DINING_GLB);

  const root = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if (std?.map) std.map.colorSpace = THREE.SRGBColorSpace;
        if (std) {
          std.envMapIntensity = 0.85;
          std.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);

  useLayoutEffect(() => {
    return () => {
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose?.();
      });
    };
  }, [root]);

  return (
    <primitive
      object={root}
      scale={scale}
      position={[0, 0, 0]}
      // glTF 已是 Y-up
    />
  );
}

useGLTF.preload(DINING_GLB);
