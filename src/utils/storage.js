import { LEGACY_STORAGE_KEY, STORAGE_KEY } from "./sessionSchema";

const DB_NAME = "AuraSenseDB";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

function hasIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

function readLocalSessions() {
  const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function readSessionsFromIndexedDb() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(
        [...(request.result ?? [])].sort((left, right) => {
          const leftTime = new Date(left.date).getTime() || 0;
          const rightTime = new Date(right.date).getTime() || 0;
          return rightTime - leftTime;
        })
      );
    };
    request.onerror = () => reject(request.error ?? new Error("Failed to read sessions"));
    transaction.oncomplete = () => database.close();
  });
}

export async function writeSessionsToIndexedDb(sessions) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const clearRequest = store.clear();

    clearRequest.onerror = () => reject(clearRequest.error ?? new Error("Failed to clear store"));
    clearRequest.onsuccess = () => {
      sessions.forEach((session) => {
        store.put(session);
      });
    };

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error ?? new Error("Failed to write sessions"));
  });
}

export async function readSessionsWithMigration() {
  const localSessions = readLocalSessions();

  if (!hasIndexedDb()) {
    return {
      sessions: localSessions,
      storageMode: "localStorage",
    };
  }

  try {
    const indexedDbSessions = await readSessionsFromIndexedDb();

    if (indexedDbSessions.length) {
      return {
        sessions: indexedDbSessions,
        storageMode: "indexedDB",
      };
    }

    if (localSessions.length) {
      await writeSessionsToIndexedDb(localSessions);
      return {
        sessions: localSessions,
        storageMode: "indexedDB",
      };
    }

    return {
      sessions: [],
      storageMode: "indexedDB",
    };
  } catch {
    return {
      sessions: localSessions,
      storageMode: "localStorage",
    };
  }
}

export async function persistSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

  if (!hasIndexedDb()) {
    return "localStorage";
  }

  try {
    await writeSessionsToIndexedDb(sessions);
    return "indexedDB";
  } catch {
    return "localStorage";
  }
}
