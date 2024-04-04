import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import useAuthState from "../Fonctions/UseAuthState";
import useUserData from "../Fonctions/UserData";
import CircleIcon from "@mui/icons-material/Circle";
import PhotoIcon from "@mui/icons-material/Photo";
import { storage, auth } from "../../firebase-config";
import { listAll, getDownloadURL, ref, deleteObject } from "firebase/storage";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { addProfilPic } from "../Events/Files";
import { addProfilPicUrl } from "../Fonctions/UserUrl";
import "../Users/Compte.css";

export default function HeaderPics({ text, url }) {
  const navigation = useNavigate();
  const user = useAuthState();
  const uid = user ? user.uid : null;
  const userData = useUserData(uid);
  const [ProfilPic, setProfilPic] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reloadPage, setReloadPage] = useState(false); // State pour recharger la page
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleEventsClick = () => {
    navigate("/events");
  };
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        console.log("Utilisateur déconnecté avec succès");
        alert("Vous allez être déconnecté.");
        navigation("/");
      })
      .catch((error) => {
        console.error("Erreur lors de la déconnexion:", error);
      });
  };

  useEffect(() => {
    const fetchProfilePictures = async () => {
      try {
        if (!uid) return;

        const imagesRef = ref(storage, `ProfilPic/${uid}`);
        const imageUrls = [];
        const imageList = await listAll(imagesRef);

        for (const imageRef of imageList.items) {
          const url = await getDownloadURL(imageRef);
          addProfilPicUrl(uid, url);
          imageUrls.push(url);
        }
      } catch (error) {
        console.error("Error fetching profile pictures: ", error);
      }
    };
    fetchProfilePictures();
  }, [uid]);

  const handleDeleteFolder = async (folderPath) => {
    const folderRef = ref(storage, folderPath);

    try {
      const listResult = await listAll(folderRef);

      const deleteFilePromises = listResult.items.map((item) => {
        return deleteObject(item);
      });

      await Promise.all(deleteFilePromises);

      await deleteObject(folderRef);

      console.log("Folder deleted successfully");
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleUpload = () => {
    return new Promise((resolve, reject) => {
      const folderPath = `ProfilPic/${uid}`;
      handleDeleteFolder(folderPath)
        .then(() => {
          addProfilPic(uid, ProfilPic)
            .then(() => {
              resolve();
              setReloadPage(true); // Déclenche le rechargement de la page
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          console.error("Error handling upload:", error);
          reject(error);
        });
    });
  };

  const handleImageValidation = () => {
    handleUpload()
      .then(() => {
        closePopup();
      })
      .catch((error) => {
        console.error("Error handling image upload:", error);
      });
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setProfilPic(file);
    setSelectedImage(URL.createObjectURL(file)); // Pour pré-afficher l'image sélectionnée
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
    setSelectedImage(null); // Réinitialiser l'image sélectionnée lors de l'ouverture du pop-up
  };

  const handlePopupClick = (event) => {
    if (!event.target.closest(".popup-content")) {
      setShowPopup(false); // Fermer le pop-up si l'utilisateur clique en dehors des éléments cliquables
    }
  };

  useEffect(() => {
    if (reloadPage) {
      setReloadPage(false); // Réinitialise le state pour éviter une boucle infinie
      window.location.reload();
    }
  }, [reloadPage]);

  return (
    <div className="HeadEvent">
      <div className="icon">
        <ArrowBackIosIcon onClick={handleEventsClick} />
      </div>
      <div className="ProfilPic" onClick={togglePopup}>
        {userData && userData.photoUrl ? (
          <div class="modif">
            <img src={userData.photoUrl} alt={`Profil Pics`} />
            <PhotoCameraIcon />
          </div>
        ) : (
          <CircleIcon />
        )}
      </div>

      <h2>{text}</h2>
      <div className="LogOut">
        <button onClick={handleSignOut}>Se déconnecter</button>
      </div>

      {showPopup && (
        <div className="popup" onClick={handlePopupClick}>
          <div className="popup-content">
            {!selectedImage && (
              <div>
                <div
                  className="ProfilPic"
                  style={{
                    marginBottom: "40px",
                  }}>
                  <img src={userData.photoUrl} alt={`Profil pics`} />
                </div>
                <div className="ChangePic">
                  <PhotoIcon />
                  <button onClick={() => fileInputRef.current.click()}>
                    Changer ma photo de profil
                  </button>
                </div>
              </div>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            {selectedImage && ( // Afficher l'image seulement si un fichier est sélectionné
              <img
                src={selectedImage}
                alt="Selected"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "cover",
                  alignItems: "center",
                  paddingBottom: "20px",
                  borderRadius: "50%",
                }}
              />
            )}
            {selectedImage && (
              <div className="ChangePic">
                <button onClick={handleImageValidation}>Valider</button>
              </div>
            )}
          </div>
        </div>
      )}

      {!user && <p>Aucun utilisateur connecté</p>}
    </div>
  );
}
