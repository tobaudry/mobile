import { database, ref, set } from "../../firebase-config";

function addProfilPicUrl(uid, url) {
  try {
    set(ref(database, `users/${uid}/photoUrl`), url);
    console.log("Profil picture URL added successfully");
  } catch (error) {
    console.error("Error adding profil picture URL: ", error.message);
  }
}

export { addProfilPicUrl };
