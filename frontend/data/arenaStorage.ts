"use client";

import type { ArenaGeneratedSet, ArenaStore } from "@/types/arena";
import type { ProductCategory } from "@/types/evaluation";

const ARENA_STORAGE_KEY = "fin-ai-arena-results-v1";
const ARENA_STORAGE_EVENT = "fin-ai-arena-storage-change";
const EMPTY_ARENA_STORE: ArenaStore = {};

let cachedRawStore = "";
let cachedParsedStore: ArenaStore = EMPTY_ARENA_STORE;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readArenaStore(): ArenaStore {
  if (!canUseStorage()) return EMPTY_ARENA_STORE;

  try {
    const raw = window.localStorage.getItem(ARENA_STORAGE_KEY);
    if (!raw) {
      cachedRawStore = "";
      cachedParsedStore = EMPTY_ARENA_STORE;
      return cachedParsedStore;
    }

    if (raw === cachedRawStore) {
      return cachedParsedStore;
    }

    const parsed = JSON.parse(raw) as ArenaStore;
    cachedRawStore = raw;
    cachedParsedStore = parsed ?? EMPTY_ARENA_STORE;
    return cachedParsedStore;
  } catch {
    cachedRawStore = "";
    cachedParsedStore = EMPTY_ARENA_STORE;
    return cachedParsedStore;
  }
}

export function writeArenaStore(nextStore: ArenaStore) {
  if (!canUseStorage()) return;
  const serialized = JSON.stringify(nextStore);
  cachedRawStore = serialized;
  cachedParsedStore = nextStore;
  window.localStorage.setItem(ARENA_STORAGE_KEY, serialized);
  window.dispatchEvent(new Event(ARENA_STORAGE_EVENT));
}

export function saveArenaSet(set: ArenaGeneratedSet) {
  const current = readArenaStore();
  const merged: ArenaStore = {
    ...current,
    [set.category]: set,
  };
  writeArenaStore(merged);
}

export function getArenaSetByCategory(category: ProductCategory): ArenaGeneratedSet | null {
  const store = readArenaStore();
  return store[category] ?? null;
}

export function clearArenaSetByCategory(category: ProductCategory) {
  const store = readArenaStore();
  if (!store[category]) return;

  const nextStore = { ...store };
  delete nextStore[category];
  writeArenaStore(nextStore);
}

export function subscribeArenaStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== ARENA_STORAGE_KEY) return;
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ARENA_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ARENA_STORAGE_EVENT, onStoreChange);
  };
}

export function getArenaStoreServerSnapshot(): ArenaStore {
  return EMPTY_ARENA_STORE;
}
