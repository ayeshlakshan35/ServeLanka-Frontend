// services/createpost.ts
import {
  addDoc,
  collection,
  Timestamp
} from "firebase/firestore";
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
    uid: user.uid,
    published: true,
    // set client timestamp immediately so collection-group queries ordered by
    // `createdAt` include the new document for realtime listeners
    createdAt: Timestamp.now(),
    status: "open",
  });

  return docRef.id;
}
