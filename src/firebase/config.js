import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyBuZsccNFx7-zaBTiJj1tTBfk-TqsypWZY",
  authDomain: "ai-based-student.firebaseapp.com",
  projectId: "ai-based-student",
  storageBucket: "ai-based-student.firebasestorage.app",
  messagingSenderId: "231576016241",
  appId: "1:231576016241:web:8ad8cffe9428317ae6d2d0",
  measurementId: "G-T5ENYZ3MFR"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)
