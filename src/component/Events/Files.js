import { v4 as uuidv4 } from "uuid";
import {
  uploadBytes,
  listAll,
  getDownloadURL,
  ref,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../firebase-storage";

async function addFile(id, name) {
  try {
    const uid = uuidv4();
    const folderPath = `events/${id}/${uid}`;
    const imgRef = ref(storage, folderPath);
    await uploadBytes(imgRef, name);
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de l'ajout du fichier :",
      error
    );
  }
}

async function addProfilPic(id, name) {
  try {
    const uid = uuidv4();
    const folderPath = `ProfilPic/${id}/${uid}`;
    const imgRef = ref(storage, folderPath);
    await uploadBytes(imgRef, name);
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de l'ajout du fichier :",
      error
    );
  }
}

async function deleteFolder(id, uid) {
  try {
    const folderPath = `ProfilPic/${id}`;
    const imgRef = ref(storage, folderPath);
    await deleteObject(imgRef);
    console.log("Le dossier a été supprimé avec succès.");
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la suppression du dossier :",
      error
    );
  }
}

async function readAllPhotos(folderPath) {
  try {
    const folderRef = ref(storage, folderPath);
    const listResult = await listAll(folderRef);
    const photoURLs = [];
    await Promise.all(
      listResult.items.map(async (itemRef) => {
        const photoURL = await getDownloadURL(itemRef);
        photoURLs.push(photoURL);
      })
    );
    return photoURLs;
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la lecture des photos :",
      error
    );
    throw error;
  }
}

export { addFile, readAllPhotos, addProfilPic, deleteFolder };