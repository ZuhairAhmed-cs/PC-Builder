/**
 * IndexedDB utilities for caching GLB 3D model files
 */

const DB_NAME = "pc-builder-models";
const DB_VERSION = 1;
const STORE_NAME = "glb-models";
const MODEL_KEY = "custom_gaming_pc";

let dbInstance: IDBDatabase | null = null;

/**
 * Check if IndexedDB is available in the current browser
 */
export function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

/**
 * Initialize and open the IndexedDB database
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function isGLBCached(): Promise<boolean> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count(MODEL_KEY);

      request.onsuccess = () => {
        resolve(request.result > 0);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

export async function getGLBFromCache(): Promise<Blob | null> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(MODEL_KEY);

      request.onsuccess = () => {
        const result = request.result;
        if (result instanceof Blob) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

export async function storeGLBInCache(blob: Blob): Promise<boolean> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, MODEL_KEY);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

export function createBlobURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

const GLB_CDN_URL =
  "https://eu-assets.contentstack.com/v3/assets/blt46050ed83963b80a/bltcbeee573d23729f7/6955646eb3a384c5b1bc4ff7/custom_gaming_pc.glb";

export async function fetchAndCacheGLB(): Promise<Blob | null> {
  try {
    const response = await fetch(GLB_CDN_URL);

    if (!response.ok) {
      console.error("Failed to fetch GLB from CDN:", response.statusText);
      return null;
    }

    const blob = await response.blob();

    await storeGLBInCache(blob).catch(() => {
      console.warn("Failed to cache GLB in IndexedDB");
    });

    return blob;
  } catch (error) {
    console.error("Error fetching GLB:", error);
    return null;
  }
}

export async function getGLB(): Promise<Blob | null> {
  const cached = await getGLBFromCache();
  if (cached) {
    return cached;
  }

  return fetchAndCacheGLB();
}
