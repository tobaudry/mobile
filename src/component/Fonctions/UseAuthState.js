import { useEffect, useState } from "react";
import { auth } from "../../firebase-config";

function useAuthState() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return user;
}

export default useAuthState;
