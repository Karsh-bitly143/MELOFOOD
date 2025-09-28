import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyANX-s8VaJywtCf7q05wSLjBDAvmp2ihu4",
  authDomain: "dishdash-e28cf.firebaseapp.com",
  projectId: "dishdash-e28cf",
  storageBucket: "dishdash-e28cf.appspot.com",
  messagingSenderId: "132035113047",
  appId: "1:132035113047:web:f11b859c873f036da67312",
  measurementId: "G-CYKQK51FFV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth: use different init for native vs web
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app); // web uses default auth
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);
const imageDb = getStorage(app);

export { auth, db, imageDb };
