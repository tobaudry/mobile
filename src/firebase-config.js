import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInWithPhoneNumber } from "firebase/auth";
import { ref } from "firebase/database";
import { push } from "firebase/database";
import { set } from "firebase/database";
import { query } from "firebase/database";
import { orderByChild } from "firebase/database";
import { onValue } from "firebase/database";
import { equalTo } from "firebase/database";
import { getStorage } from "firebase/storage";

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
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export {
  auth,
  database,
  storage,
  signInWithPhoneNumber,
  ref,
  push,
  set,
  query,
  orderByChild,
  onValue,
  equalTo,
};
