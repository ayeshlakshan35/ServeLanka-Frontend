// src/services/users.api.ts
import { db } from "../config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

/* ================================
   TYPES (OPTIONAL BUT HELPFUL)
================================ */
export type VerificationStatus = "not_started" | "in_review" | "approved" | "rejected";

export type UserDoc = {
  uid: string;
  name: string;
  email: string;
  role: "user" | "provider";
  isVerified: boolean; // keep for backward compatibility

  // Profile fields (for edit profile)
  phone: string;
  address: string;
  photoUrl: string;

  // Provider verification
  verification: {
    status: VerificationStatus;
    nationalId: {
      frontUploaded: boolean;
      backUploaded: boolean;
      frontUrl: string | null;
      backUrl: string | null;
    };
    phone: {
      number: string;
      verified: boolean;
    };
    certificatesUploaded: boolean;
    submittedAt: any;
    approvedAt?: any;
    rejectedAt?: any;
  };

  createdAt: any;
  updatedAt?: any;
};

/* ================================
   CREATE USER PROFILE
================================ */
export const createUserProfile = async (uid: string, name: string, email: string) => {
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    uid,
    name,
    email,
    role: "user",
    isVerified: false,

    // ✅ new profile fields
    phone: "",
    address: "",
    photoUrl: "",

    // Provider verification (initial state)
    verification: {
      status: "not_started",
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
    updatedAt: serverTimestamp(),
  });
};

/* ================================
   ENSURE USER PROFILE EXISTS
   (create if missing)
================================ */
export const ensureUserProfile = async (uid: string, seed?: Partial<UserDoc>) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) return;

  // fallback for safety if doc missing
  await setDoc(userRef, {
    uid,
    name: seed?.name ?? "",
    email: seed?.email ?? "",
    role: seed?.role ?? "user",
    isVerified: seed?.isVerified ?? false,
    phone: seed?.phone ?? "",
    address: seed?.address ?? "",
    photoUrl: seed?.photoUrl ?? "",
    verification: seed?.verification ?? {
      status: "not_started",
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
    updatedAt: serverTimestamp(),
  });
};

/* ================================
   GET USER PROFILE
================================ */
export const getUserProfile = async (uid: string): Promise<UserDoc | null> => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return null;
  return snapshot.data() as UserDoc;
};

/* ================================
   UPDATE USER PROFILE (EDIT PAGE)
   ✅ name, phone, address, photoUrl
================================ */
export const updateUserProfile = async (
  uid: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    photoUrl: string;
    role: "user" | "provider";
    isVerified: boolean;
  }>
) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/* ================================
   START PROVIDER VERIFICATION
================================ */
export const startProviderVerification = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    "verification.status": "not_started",
    updatedAt: serverTimestamp(),
  });
};

/* ================================
   UPDATE VERIFICATION PROGRESS
   ✅ FIXED: never overwrite whole object
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

  const patch: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  // nationalId nested updates
  if (data.nationalId) {
    if (data.nationalId.frontUploaded !== undefined)
      patch["verification.nationalId.frontUploaded"] = data.nationalId.frontUploaded;
    if (data.nationalId.backUploaded !== undefined)
      patch["verification.nationalId.backUploaded"] = data.nationalId.backUploaded;
    if (data.nationalId.frontUrl !== undefined)
      patch["verification.nationalId.frontUrl"] = data.nationalId.frontUrl;
    if (data.nationalId.backUrl !== undefined)
      patch["verification.nationalId.backUrl"] = data.nationalId.backUrl;
  }

  // phone nested updates
  if (data.phone) {
    if (data.phone.number !== undefined) patch["verification.phone.number"] = data.phone.number;
    if (data.phone.verified !== undefined) patch["verification.phone.verified"] = data.phone.verified;
  }

  // certificates
  if (data.certificatesUploaded !== undefined) {
    patch["verification.certificatesUploaded"] = data.certificatesUploaded;
  }

  await updateDoc(userRef, patch);
};

/* ================================
   SUBMIT VERIFICATION FOR REVIEW
================================ */
export const submitVerification = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    "verification.status": "in_review",
    "verification.submittedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/* ================================
   APPROVE VERIFICATION (CLIENT SIDE)
   ✅ For now: when submit is successful
   Later: admin should set this
================================ */
export const approveProviderVerification = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    "verification.status": "approved",
    "verification.approvedAt": serverTimestamp(),
    isVerified: true, // keep your old field in sync
    role: "provider",
    updatedAt: serverTimestamp(),
  });
};

/* ================================
   SIMPLE CHECK
================================ */
export const isProviderApproved = (user: UserDoc | null) => {
  return user?.verification?.status === "approved";
};
