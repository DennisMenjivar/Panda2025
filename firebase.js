// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBIH1KrvZV8XN721RwQs3DqD8iWC-MsUPM',
  authDomain: 'panda-final-2025.firebaseapp.com',
  projectId: 'panda-final-2025',
  storageBucket: 'panda-final-2025.firebasestorage.app',
  messagingSenderId: '518573373159',
  appId: '1:518573373159:web:171599c61793c187465442',
  measurementId: 'G-EFN1JXHW1Q',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
