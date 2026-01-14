import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function registerWithEmail(
    name:string,
    email: string,
    password: string
) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: name,
        email: email,
        role: "user",
        createdAt: Date.now(),
    });
    return cred.user;
}


export async function loginWithEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
}