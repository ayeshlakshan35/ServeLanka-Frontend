import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

export type Job = {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  location: string;
  imageUrls: string[];
  createdBy: string;
  status: "open" | "closed";
  createdAt?: any;
};

const jobsCol = collection(db, "jobs");

// ✅ CREATE JOB
export async function createJob(jobData: {
  title: string;
  category: string;
  description: string;
  budget: number;
  location: string;
  imageUrls?: string[];
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const payload = {
    title: jobData.title.trim(),
    category: (jobData.category || "Other").trim(),
    description: jobData.description.trim(),
    budget: jobData.budget,
    location: jobData.location.trim(),
    imageUrls: jobData.imageUrls || [],
    createdBy: user.uid,
    status: "open" as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(jobsCol, payload);
  return ref.id;
}

// ✅ LIST JOBS (for jobs tab)
export async function listJobs(max: number = 30) {
  const q = query(jobsCol, orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as Job[];
}

// ✅ GET ONE JOB (for job details)
export async function getJobById(jobId: string) {
  const ref = doc(db, "jobs", jobId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Job not found");

  return {
    id: snap.id,
    ...(snap.data() as any),
  } as Job;
}
