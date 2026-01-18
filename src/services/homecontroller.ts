// src/services/homecontroller.ts
import { db } from "../config/firebase";
import {
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
  DocumentData,
  limit,
} from "firebase/firestore";

export type HomePost = {
  id: string;
  uid: string;          // owner user id
  category: string;
  notes: string;
  price: number;
  imageUrl: string;
  createdAt?: any;
};

export function listenHomePosts(
  onChange: (posts: HomePost[]) => void,
  onError?: (e: any) => void,
  options?: { pageSize?: number }
) {
  const pageSize = options?.pageSize ?? 30;

  // ✅ reads ALL subcollections named "posts" under any user
  const q = query(
    collectionGroup(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  const unsub = onSnapshot(
    q,
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
          createdAt: data.createdAt,
        };
      });

      onChange(posts);
    },
    (err) => onError?.(err)
  );

  return unsub;
}
