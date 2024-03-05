import { database } from "../../firebase-config";

import { ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";

function useUserData(uid) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (uid) {
      const usersRef = ref(database, "users/" + uid);
      onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const userDataFromDatabase = snapshot.val();
          setUserData(userDataFromDatabase);
        }
      });
    }
  }, [uid]);
  return userData;
}

export default useUserData;
