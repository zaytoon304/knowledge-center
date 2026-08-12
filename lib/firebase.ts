import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDRMhTfKd7hVhGA-lrTwKZl-pDD4xdoBhw",
  authDomain: "arqam-center.firebaseapp.com",
  databaseURL: "https://arqam-center-default-rtdb.firebaseio.com",
  projectId: "arqam-center",
  storageBucket: "arqam-center.firebasestorage.app",
  messagingSenderId: "24098614522",
  appId: "1:24098614522:web:19d52ea147e6ab6ad5ad43",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);

let signInPromise: Promise<void> | null = null;

// يضمن وجود مستخدم مجهول مسجّل دخول قبل أي عملية قراءة/كتابة على قاعدة
// البيانات — قواعد الأمان تتطلب auth != null، بدون هذا كل الطلبات تُرفض
export function ensureSignedIn(): Promise<void> {
  if (auth.currentUser) return Promise.resolve();
  if (signInPromise) return signInPromise;
  signInPromise = signInAnonymously(auth)
    .then(() => undefined)
    .catch((e) => {
      signInPromise = null;
      throw e;
    });
  return signInPromise;
}
