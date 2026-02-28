// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACrMDpYzZ3pDDrZH1ulk-xBUR9vcTATC0",
  authDomain: "chronos-counter.firebaseapp.com",
  projectId: "chronos-counter",
  storageBucket: "chronos-counter.firebasestorage.app",
  messagingSenderId: "262937343005",
  appId: "1:262937343005:web:b13fb68c1be41feb8d82f4",
  measurementId: "G-51SQBGWVMT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Función para subir el récord a la colección "leaderboard"
export const saveScoreToCloud = async (playerName, score, level) => {
  try {
    const docRef = await addDoc(collection(db, "leaderboard"), {
      name: playerName.toUpperCase(), // Forzamos mayúsculas
      score: score,
      level: level,
      timestamp: new Date().toISOString()
    });
    console.log("Récord guardado con ID: ", docRef.id);
    return true;
  } catch (error) {
    console.error("Error al guardar el récord: ", error);
    return false;
  }
};
// ==========================================
// NUEVO: Función para obtener el Top 10
// ==========================================
export const getTopScores = async () => {
  try {
    // Pedimos la colección "leaderboard", ordenada por "score" de forma descendente, y limitamos a los 10 mejores
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    
    const scores = [];
    querySnapshot.forEach((doc) => {
      scores.push({ id: doc.id, ...doc.data() });
    });
    
    return scores;
  } catch (error) {
    console.error("Error al obtener el leaderboard: ", error);
    return [];
  }
};