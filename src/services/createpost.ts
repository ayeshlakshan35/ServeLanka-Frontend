// services/createpost.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export type CreatePostPayload = {
  notes: string;
  price: number;
  imageUrl: string;
  category: string;
};

export async function createPost(payload: CreatePostPayload) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to create a post.");

  // ✅ users/{uid}/posts
  const postsRef = collection(db, "users", user.uid, "posts");

  const docRef = await addDoc(postsRef, {
    notes: payload.notes,
    price: payload.price,
    imageUrl: payload.imageUrl,
    category: payload.category,
    createdAt: serverTimestamp(),
    status: "open",
  });

  return docRef.id;
}
