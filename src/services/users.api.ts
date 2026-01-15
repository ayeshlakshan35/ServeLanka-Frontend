import { db } from "../config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ================================
   CREATE USER PROFILE
================================ */
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

    // Provider verification (initial state)
    verification: {
      status: "not_started", // not_started | in_review | approved | rejected
      nationalId: {
        frontUploaded: false,
        backUploaded: false,
        frontUrl: null,
        backUrl: null,
      },
      phone: {
        number: "",
        verified: false,
      },
      certificatesUploaded: false,
      submittedAt: null,
    },

    createdAt: serverTimestamp(),
  });
};

/* ================================
   GET USER PROFILE
================================ */
export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
};

/* ================================
   UPDATE USER PROFILE (GENERIC)
================================ */
export const updateUserProfile = async (
  uid: string,
  data: Partial<{
    name: string;
    email: string;
    role: "user" | "provider";
    isVerified: boolean;
  }>
) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};

/* ================================
   START PROVIDER VERIFICATION
================================ */
export const startProviderVerification = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    "verification.status": "not_started",
  });
};

/* ================================
   UPDATE VERIFICATION PROGRESS
================================ */
export const updateVerification = async (
  uid: string,
  data: Partial<{
    nationalId: {
      frontUploaded?: boolean;
      backUploaded?: boolean;
      frontUrl?: string | null;
      backUrl?: string | null;
    };
    phone: {
      number?: string;
      verified?: boolean;
    };
    certificatesUploaded?: boolean;
  }>
) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    verification: {
      ...data,
    },
  });
};

/* ================================
   SUBMIT VERIFICATION FOR REVIEW
================================ */
export const submitVerification = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    "verification.status": "in_review",
    "verification.submittedAt": serverTimestamp(),
  });
};
