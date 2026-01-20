// src/services/homecontroller.ts
import {
  collectionGroup,
  DocumentData,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../config/firebase";

export type HomePost = {
  id: string;
  uid: string; // owner user id
  category: string;
  notes: string;
  price: number;
  imageUrl: string;
  createdAt?: any;
};

export function listenHomePosts(
  onChange: (posts: HomePost[]) => void,
  onError?: (e: any) => void,
  options?: { pageSize?: number },
) {
  const pageSize = options?.pageSize ?? 30;

  // ✅ reads ALL subcollections named "posts" under any user
  const q = query(
    collectionGroup(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(pageSize),
  );

  // includeMetadataChanges: true lets clients receive local/pending writes
  const unsub = onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => {
      const posts: HomePost[] = snap.docs.map((d) => {
        const data = d.data() as DocumentData;

        // users/{uid}/posts/{postId}  -> uid is path segment 2
        const uid = d.ref.path.split("/")[1] || "";

        return {
          id: d.id,
          uid,
          category: data.category ?? "",
          notes: data.notes ?? "",
          price: Number(data.price ?? 0),
          imageUrl: data.imageUrl ?? "",
          // serverTimestamp may be null locally until server updates it
          createdAt: data.createdAt ?? null,
        };
      });

      onChange(posts);
    },
    (err) => onError?.(err),
  );

  return unsub;
}
