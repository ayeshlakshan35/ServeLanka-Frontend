import { db } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";

/**
 * Create user profile in Firestore
 */
export const createUserProfile = async (
  uid: string,
  name: string,
  email: string
) => {
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    uid,
    name,
    email,
    role: "user",
    isVerified: false,
    createdAt: new Date(),
  });
};

/* Get user profile from Firestore */
export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
};

export const updateUserProfile = async (
  uid: string,
  name: string
) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    name,
  });
};
