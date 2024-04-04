import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase-config";
import useAuthState from "./UseAuthState";

const useInvitationCount = () => {
  const [invitationCount, setInvitationCount] = useState(0);
  const user = useAuthState();
  const uid = user ? user.uid : null;

  useEffect(() => {
    if (uid) {
      console.log(uid);
      const invitationsRef = ref(database, `invitations`);
      onValue(invitationsRef, (snapshot) => {
        const invitationsData = snapshot.val();
        if (invitationsData) {
          const invitationsList = Object.values(invitationsData).filter(
            (invitation) => invitation.receiver === uid
          );
          setInvitationCount(invitationsList.length);
        } else {
          setInvitationCount(0);
        }
      });
    }
  }, [uid]);

  return invitationCount;
};

export default useInvitationCount;
