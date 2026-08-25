import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut } from "firebase/auth";
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

// هوية الأدمن الحقيقية بـFirebase Auth — تحل محل مقارنة كلمة مرور محلية
// بالكود (كانت مستخرَجة بسهولة من ملف JS). التحقق يصير على سيرفر Firebase
// فعلياً، وقواعد الأمان تقدر تميّز هذا المستخدم عن أي زائر مجهول عادي
// عبر auth.token.email.
export const ADMIN_EMAIL = "admin@arqam-knowledge-center.app";

export async function signInAsAdmin(password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
}

export async function signOutAdmin(): Promise<void> {
  if (auth.currentUser?.email === ADMIN_EMAIL) await signOut(auth);
}
