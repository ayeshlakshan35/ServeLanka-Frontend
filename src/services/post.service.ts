// src/services/post.service.ts
import { auth, db } from "../config/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  DocumentData,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export type MyPost = {
  id: string;
  category: string;
  notes: string;
  price: number;
  imageUrl: string;
  createdAt?: any;
};

export function listenMyPosts(
  onChange: (posts: MyPost[]) => void,
  onError?: (e: any) => void
) {
  const user = auth.currentUser;
  if (!user) {
    onChange([]);
    return () => {};
  }

  const ref = collection(db, "users", user.uid, "posts");
  const q = query(ref, orderBy("createdAt", "desc"));

  const unsub = onSnapshot(
    q,
    (snap) => {
      const posts: MyPost[] = snap.docs.map((d) => {
        const data = d.data() as DocumentData;
        return {
          id: d.id,
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

/** ✅ Delete a post */
export async function deleteMyPost(postId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  await deleteDoc(doc(db, "users", user.uid, "posts", postId));
}

/** ✅ Get one post by id (for edit screen) */
export async function getMyPostById(postId: string): Promise<MyPost> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, "users", user.uid, "posts", postId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Post not found");

  const data = snap.data() as DocumentData;

  return {
    id: snap.id,
    category: data.category ?? "",
    notes: data.notes ?? "",
    price: Number(data.price ?? 0),
    imageUrl: data.imageUrl ?? "",
    createdAt: data.createdAt,
  };
}

/** ✅ Update post fields (edit) */
export async function updateMyPost(
  postId: string,
  updates: Partial<Pick<MyPost, "category" | "notes" | "price" | "imageUrl">>
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, "users", user.uid, "posts", postId);

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
