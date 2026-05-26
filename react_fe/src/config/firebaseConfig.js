import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    'AIzaSyDtYLZiyunzCd6SzPXPVU59WvHfu8haUAk',
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    'thanh-88098.firebaseapp.com',
  projectId:
    process.env.REACT_APP_FIREBASE_PROJECT_ID ||
    'thanh-88098',
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    'thanh-88098.firebasestorage.app',
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    '921690973798',
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    '1:921690973798:web:0b73e1da788f47230befa7',
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ||
    'G-Y064GH5BYZ',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const firebaseDebugConfig = {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  hasApiKey: Boolean(firebaseConfig.apiKey),
};
