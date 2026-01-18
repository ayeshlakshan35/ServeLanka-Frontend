import { db } from "../config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment,
  runTransaction,
} from "firebase/firestore";

/* Types And Interfaces */
export type VerificationStatus =
  | "not_started"
  | "in_review"
  | "approved"
  | "rejected";

export type UserDoc = {
  uid: string;
  name: string;
  email: string;
  role: "user" | "provider";
  isVerified: boolean;

  // Profile fields for edit profile
  phone: string;
  address: string;
  photoUrl: string;

  // Provider verification
  verification: {
    status: VerificationStatus;
    nationalId: {
      number: string;
      verified: boolean;
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

/* NIC Validation Accoding To Sri Lanka */

export const normalizeSriLankaNIC = (raw: string) => raw.trim().toUpperCase();

export const validateSriLankaNIC = (
  raw: string
): { ok: boolean; normalized?: string; reason?: string } => {
  const nic = normalizeSriLankaNIC(raw);

  const oldPattern = /^[0-9]{9}[V]$/;
  const newPattern = /^[0-9]{12}$/;

  const validateDay = (ddd: number) => {
    // Male: 001-366, female: 501-866
    const male = ddd >= 1 && ddd <= 366;
    const female = ddd >= 501 && ddd <= 866;
    return male || female;
  };

  if (oldPattern.test(nic)) {
    const yy = parseInt(nic.slice(0, 2), 10);
    const ddd = parseInt(nic.slice(2, 5), 10);

    if (!validateDay(ddd)) {
      return { ok: false, reason: "Invalid NIC Enter a valid ID number" };
    }

    // Infer century reasonably
    const nowYear = new Date().getFullYear();
    const nowYY = nowYear % 100;
    const year = yy > nowYY ? 1900 + yy : 2000 + yy;

    if (year < 1900 || year > nowYear) {
      return { ok: false, reason: "Invalid NIC Enter a valid ID number" };
    }

    return { ok: true, normalized: nic };
  }

  if (newPattern.test(nic)) {
    const yyyy = parseInt(nic.slice(0, 4), 10);
    const ddd = parseInt(nic.slice(4, 7), 10);

    if (yyyy < 1900 || yyyy > new Date().getFullYear()) {
      return { ok: false, reason: "Invalid NIC Enter a valid ID number" };
    }

    if (!validateDay(ddd)) {
      return { ok: false, reason: "Invalid NIC Enter a valid ID number" };
    }

    return { ok: true, normalized: nic };
  }

  return {
    ok: false,
    reason: "Invalid NIC Enter a valid ID number",
  };
};

/* NIC Uniqueness */

export const reserveNationalId = async (uid: string, rawNic: string) => {
  const v = validateSriLankaNIC(rawNic);
  if (!v.ok || !v.normalized)
    throw new Error(v.reason || "Invalid NIC Enter a valid ID number");

  const nic = v.normalized;
  const nicRef = doc(db, "national_ids", nic);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(nicRef);

    if (snap.exists()) {
      const data = snap.data() as any;
      // NIC already belongs to another UID
      if (data?.uid && data.uid !== uid) {
        throw new Error("This NIC is already used by another account.");
      }
      // Same uid 
      return;
    }

    tx.set(nicRef, {
      uid,
      createdAt: serverTimestamp(),
    });
  });

  return nic;
};

/* Create User Profile */
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

    // New profile fields
    phone: "",
    address: "",
    photoUrl: "",

    // Provider verification object
    verification: {
      status: "not_started",
      nationalId: {
        number: "",
        verified: false,
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

export const ensureUserProfile = async (uid: string, seed?: Partial<UserDoc>) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) return;

  // Fallback for safety if doc missing
  await setDoc(
    userRef,
    {
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
          number: "",
          verified: false,
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
    },
    { merge: true }
  );
};

/* Get User Profile */
export const getUserProfile = async (uid: string): Promise<UserDoc | null> => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return null;
  return snapshot.data() as UserDoc;
};

/* Fast get-or-create user profile */
export const getOrCreateUserProfile = async (
  uid: string,
  seed?: Partial<UserDoc>
): Promise<UserDoc> => {
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  await ensureUserProfile(uid, seed);
  const created = await getUserProfile(uid);

  if (!created) {
    throw new Error("Failed to create user profile document.");
  }

  return created;
};

/* Update User Profile */
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

/* Start Provider Verification */
export const startProviderVerification = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    "verification.status": "not_started",
    updatedAt: serverTimestamp(),
  });
};

/* Update Verification Progress */
export const updateVerification = async (
  uid: string,
  data: Partial<{
    nationalId: {
      number?: string;
      verified?: boolean;
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

  // NationalId update
  if (data.nationalId) {
    if (data.nationalId.number !== undefined)
      patch["verification.nationalId.number"] = data.nationalId.number;

    if (data.nationalId.verified !== undefined)
      patch["verification.nationalId.verified"] = data.nationalId.verified;

    if (data.nationalId.frontUploaded !== undefined)
      patch["verification.nationalId.frontUploaded"] =
        data.nationalId.frontUploaded;

    if (data.nationalId.backUploaded !== undefined)
      patch["verification.nationalId.backUploaded"] =
        data.nationalId.backUploaded;

    if (data.nationalId.frontUrl !== undefined)
      patch["verification.nationalId.frontUrl"] = data.nationalId.frontUrl;

    if (data.nationalId.backUrl !== undefined)
      patch["verification.nationalId.backUrl"] = data.nationalId.backUrl;
  }

  // Phone number update
  if (data.phone) {
    if (data.phone.number !== undefined)
      patch["verification.phone.number"] = data.phone.number;

    if (data.phone.verified !== undefined)
      patch["verification.phone.verified"] = data.phone.verified;
  }

  // Certificates update
  if (data.certificatesUploaded !== undefined) {
    patch["verification.certificatesUploaded"] = data.certificatesUploaded;
  }

  await updateDoc(userRef, patch);
};

/* Submit Verification For Review */
export const submitVerification = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    "verification.status": "in_review",
    "verification.submittedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/* Approve Client Side Verification */
export const approveProviderVerification = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    "verification.status": "approved",
    "verification.approvedAt": serverTimestamp(),
    isVerified: true,
    role: "provider",
    updatedAt: serverTimestamp(),
  });
};

export const isProviderApproved = (user: UserDoc | null) => {
  return user?.verification?.status === "approved";
};
