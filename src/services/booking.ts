import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

export type Booking = {
  id: string;
  providerId: string; // Provider's UID
  userId: string; // Customer's UID
  postId: string; // Service post ID
  serviceName: string;
  serviceImage: string;
  customerName: string;
  customerPhone?: string;
  selectedDate: string;
  selectedTime: string;
  serviceAddress: string;
  additionalNotes: string;
  paymentMethod: "cash" | "card";
  status: "pending" | "accepted" | "completed" | "cancelled";
  createdAt: any;
};

// Create a new booking
export async function createBooking(data: Omit<Booking, "id" | "createdAt">) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to create a booking.");

  const bookingsRef = collection(db, "bookings");

  const docRef = await addDoc(bookingsRef, {
    ...data,
    userId: user.uid,
    status: "pending",
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

// Update booking status (provider action)
export async function updateBookingStatus(
  bookingId: string,
  status: "accepted" | "rejected",
) {
  const bookingRef = doc(db, "bookings", bookingId);
  await updateDoc(bookingRef, { status });
}

// Get booking by id
export async function getBookingById(bookingId: string) {
  const bookingRef = doc(db, "bookings", bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Booking;
}

// Delete booking (notification)
export async function deleteBooking(bookingId: string) {
  const bookingRef = doc(db, "bookings", bookingId);
  await deleteDoc(bookingRef);
}

// Get bookings for a provider (as notifications)
export function listenProviderBookings(
  providerId: string,
  onChange: (bookings: Booking[]) => void,
  onError?: (e: any) => void,
) {
  const q = query(
    collection(db, "bookings"),
    where("providerId", "==", providerId),
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      const bookings = snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
          }) as Booking,
      );

      onChange(bookings);
    },
    (err) => onError?.(err),
  );

  return unsub;
}

// Get bookings for a customer
export function listenCustomerBookings(
  userId: string,
  onChange: (bookings: Booking[]) => void,
  onError?: (e: any) => void,
) {
  const q = query(collection(db, "bookings"), where("userId", "==", userId));

  const unsub = onSnapshot(
    q,
    (snap) => {
      const bookings = snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
          }) as Booking,
      );

      onChange(bookings);
    },
    (err) => onError?.(err),
  );

  return unsub;
}
