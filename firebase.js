import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSCxA88PU2oJk6evK_3kK-g1TyqejXLZw",
  authDomain: "mychat-9d2d5.firebaseapp.com",
  projectId: "mychat-9d2d5",
  storageBucket: "mychat-9d2d5.appspot.com",
  messagingSenderId: "115166726685",
  appId: "1:115166726685:web:959570d28a746966a594f4",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);
const colRef = collection(db, "chats");
const storage = getStorage();
export { db, colRef, auth, storage };
