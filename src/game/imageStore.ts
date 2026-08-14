/**
 * Local image storage for photo questions.
 * Images are kept as Blobs in IndexedDB so they survive reloads and new games
 * without hitting the small localStorage quota.
 */
const DB_NAME = "the-floor-images";
const STORE = "images";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = fn(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export function putImage(id: string, blob: Blob): Promise<unknown> {
  return tx("readwrite", (store) => store.put(blob, id));
}

export function getImage(id: string): Promise<Blob | undefined> {
  return tx<Blob | undefined>("readonly", (store) => store.get(id));
}

export function deleteImage(id: string): Promise<unknown> {
  return tx("readwrite", (store) => store.delete(id));
}

const urlCache = new Map<string, string>();

/** Returns a stable object URL for a stored image, or null if it is missing. */
export async function getImageUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const blob = await getImage(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export function releaseImageUrl(id: string) {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
}
