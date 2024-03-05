import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD83CmLDTtWvumGvJ7iuWJz8QSV6y-Y0jo",
  authDomain: "piiapplication.firebaseapp.com",
  databaseURL:
    "https://piiapplication-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "piiapplication",
  storageBucket: "piiapplication.appspot.com",
  messagingSenderId: "882868331378",
  appId: "1:882868331378:web:98202e6edfb12940aaf3eb",
  measurementId: "G-F0WJD0BRCH",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref };
