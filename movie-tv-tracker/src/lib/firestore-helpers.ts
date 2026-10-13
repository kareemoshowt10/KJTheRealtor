import type { Firestore, Query, DocumentData } from 'firebase-admin/firestore';

/** Firestore 'in' queries accept at most 30 values; chunk larger lists across parallel queries. */
const IN_QUERY_LIMIT = 30;

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/** Batched get-by-doc-id — no 'in' limit, no composite index required. */
export async function getDocsByIds<T>(
  db: Firestore,
  collectionName: string,
  ids: string[]
): Promise<Map<string, T>> {
  const uniqueIds = [...new Set(ids)];
  const map = new Map<string, T>();
  if (uniqueIds.length === 0) return map;

  const refs = uniqueIds.map((id) => db.collection(collectionName).doc(id));
  const snaps = await db.getAll(...refs);

  for (const snap of snaps) {
    if (snap.exists) map.set(snap.id, { id: snap.id, ...(snap.data() as object) } as T);
  }
  return map;
}

/** where(field, 'in', values), chunked across the 30-value limit and merged. */
export async function queryWhereIn<T>(
  db: Firestore,
  collectionName: string,
  field: string,
  values: string[],
  extra?: (q: Query<DocumentData>) => Query<DocumentData>
): Promise<T[]> {
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length === 0) return [];

  const batches = chunk(uniqueValues, IN_QUERY_LIMIT);
  const results = await Promise.all(
    batches.map(async (batch) => {
      let q: Query<DocumentData> = db.collection(collectionName).where(field, 'in', batch);
      if (extra) q = extra(q);
      const snap = await q.get();
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
    })
  );
  return results.flat();
}
