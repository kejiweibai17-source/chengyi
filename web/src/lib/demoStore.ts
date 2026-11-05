/**
 * Demo 專用共用狀態：員工後台 ↔ 會員前台
 *
 * 沒有資料庫，只用瀏覽器 localStorage 存檔，並靠 `storage` 事件做「跨分頁即時同步」。
 * 在兩個分頁各開一邊，就能示範：員工改狀態 → 會員前台立即看到。
 * 僅限 Client Component 使用。
 */
import { useSyncExternalStore } from "react";
import {
  createInitialFlowState,
  type DemoEvent,
  type DemoFlowState,
} from "@/data/manuscriptFlow";

export type DemoStore = {
  flow: DemoFlowState;
  events: DemoEvent[];
};

const KEY = "cheng-yi-demo-order-v1";

function initialStore(): DemoStore {
  return {
    flow: createInitialFlowState(),
    events: [{ at: "2026-11-04 10:18", text: "您在線上商店建立了訂單。" }],
  };
}

/** 伺服器端／尚未讀取時用的固定快照（需穩定參考） */
const SERVER_SNAPSHOT: DemoStore = initialStore();

let cache: DemoStore | undefined;
const listeners = new Set<() => void>();

function parse(raw: string | null): DemoStore | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as DemoStore;
    if (data && data.flow && Array.isArray(data.events)) return data;
  } catch {
    /* ignore */
  }
  return null;
}

function load(): DemoStore {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  return parse(window.localStorage.getItem(KEY)) ?? initialStore();
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = parse(e.newValue) ?? initialStore();
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): DemoStore {
  if (!cache) cache = load();
  return cache;
}

function getServerSnapshot(): DemoStore {
  return SERVER_SNAPSHOT;
}

/** 讀取共用訂單狀態（會隨任一分頁的變更自動更新） */
export function useDemoStore(): DemoStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 更新共用狀態並同步到其他分頁 */
export function updateDemoStore(fn: (prev: DemoStore) => DemoStore) {
  const next = fn(getSnapshot());
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 容量滿或隱私模式時，仍保留於目前分頁記憶體 */
  }
  emit();
}

export function updateFlow(
  fn: (prev: DemoFlowState) => DemoFlowState,
  event?: DemoEvent,
) {
  updateDemoStore((s) => ({
    flow: fn(s.flow),
    events: event ? [event, ...s.events] : s.events,
  }));
}

export function pushEvent(event: DemoEvent) {
  updateDemoStore((s) => ({ ...s, events: [event, ...s.events] }));
}

export function resetDemoStore() {
  updateDemoStore(() => initialStore());
}
