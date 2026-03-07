import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDtYLZiyunzCd6SzPXPVU59WvHfu8haUAk",
  authDomain: "thanh-88098.firebaseapp.com",
  projectId: "thanh-88098",
  storageBucket: "thanh-88098.firebasestorage.app",
  messagingSenderId: "921690973798",
  appId: "1:921690973798:web:0b73e1da788f47230befa7",
  measurementId: "G-Y064GH5BYZ"
};

// 🚀 Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Export Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
