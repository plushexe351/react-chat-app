import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { storage, auth, db } from "../firebase"; // Adjust this import based on your firebase config file location
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ onClose, userProfile, chatCount, showMessageBtn }) => {
  const { dispatch } = useContext(ChatContext);
  const [fileMessage, setFileMessage] = useState("");
  const [newBio, setNewBio] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [err, setErr] = useState(null); // Error state
  const currentUserContext = useContext(AuthContext);
  const currentUser = userProfile || currentUserContext.currentUser;
  const isAnotherUser = userProfile !== currentUserContext.currentUser;

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent modal from closing
    setEditMode(true);
  };

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
    dispatch({ type: "TOGGLE_CHAT_VISIBILITY" });
    onClose();
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 300;
          const maxHeight = 300;
          let width = img.width;
          let height = img.height;

          // Resize image while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob.size > 100 * 1024) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      reader.onerror = () => {
        // Handle error if FileReader fails
        resolve(null); // Resolve with null to indicate compression failure
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        setFileMessage("Image Uploaded");
        setNewProfileImage(compressedFile);
      } catch (error) {
        setFileMessage("Invalid Format");
        console.error("Error compressing image:", error);
        setErr("Error compressing image");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErr(null); // Clear any previous errors
    const newUsername = e.target[1].value;
    const newBio = e.target[2].value;

    try {
      let photoURL = currentUser.photoURL;

      if (newProfileImage) {
        let fileToUpload = newProfileImage;

        if (newProfileImage.size > 100 * 1024) {
          fileToUpload = await compressImage(newProfileImage);
        }

        const storageRef = ref(storage, `avatars/${currentUser.uid}`);
        const uploadTask = await uploadBytesResumable(storageRef, fileToUpload);
        photoURL = await getDownloadURL(uploadTask.ref);
      }

      // Update user profile
      await updateProfile(auth.currentUser, {
        displayName: newUsername || currentUser.displayName,
        photoURL,
      });

      // Update user document in "users" collection
      await updateDoc(
        doc(db, "users", currentUser.uid),
        {
          displayName: newUsername || currentUser.displayName,
          photoURL,
          bio: newBio,
        },
        { merge: true }
      ); // Merge with existing data if any

      // Update userChats where currentUser is involved
      const collectionRef = collection(db, "userChats");

      const querySnapshot = await getDocs(collectionRef);

      querySnapshot.forEach(async (doc) => {
        const objects = doc.data();

        if (objects) {
          // Add null check
          for (const key in objects) {
            if (objects.hasOwnProperty(key)) {
              const objectData = objects[key];
              if (
                objectData.userInfo &&
                objectData.userInfo.uid === currentUser.uid
              ) {
                // Update the displayName, photoURL, and bio fields
                objectData.userInfo.displayName =
                  newUsername || currentUser.displayName;
                objectData.userInfo.photoURL = photoURL;
                objectData.userInfo.bio = newBio;

                // Update the document with the modified object
                await updateDoc(doc.ref, {
                  [key]: objectData,
                });
              }
            }
          }
        }
      });

      // Update currentUser context
      currentUser.displayName = newUsername || currentUser.displayName;
      currentUser.photoURL = photoURL;
      currentUser.bio = newBio;

      setEditMode(false);
      setErr("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setErr("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const stopPropagation = (e) => {
    e.stopPropagation(); // Prevent click from propagating to parent elements
  };

  return (
    <div className="user-profile">
      {editMode && (
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <h4>{currentUser.displayName}'s profile settings</h4>
          <div className="edit-profile-field">
            <label htmlFor="self-profile-image">
              <img src={currentUser.photoURL} alt="" />
              <p>Change profile image</p>
            </label>
            {fileMessage && (
              <div className="fileMessage">
                {" "}
                <FontAwesomeIcon className="fa-icon" icon={faCheck} />
                {fileMessage}
              </div>
            )}
            <input
              type="file"
              id="self-profile-image"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*" // Restrict to only accept image files
            />
            <label htmlFor="username-change-field" className="text-label">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter new username"
              defaultValue={currentUser.displayName}
              name="username-change"
              id="username-change-field"
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
            <label htmlFor="bio-change-field" className="text-label">
              Bio
            </label>
            <input
              type="text"
              placeholder="Write a bio ✨"
              defaultValue={currentUser.bio}
              name="bio-change"
              id="bio-change-field"
              onChange={(e) => setNewBio(e.target.value)}
            />
          </div>

          {err && (
            <div style={{ color: "magenta" }} className="error-message">
              {err}
            </div>
          )}

          <div className="modal-buttons">
            <button
              type="submit"
              className="modal-btn modal--follow"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              className="modal-btn modal--close"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {!editMode && (
        <div className="modal" onClick={stopPropagation}>
          <h4>{currentUser.displayName}'s profile</h4>

          <div className="profile-info">
            <img src={currentUser.photoURL} alt="" />
            <span id="profile--user-name">@{currentUser.displayName}</span>
            <span
              id="profile--email"
              onClick={!isAnotherUser ? handleEditClick : null}
            >
              {currentUser.bio ||
                (!isAnotherUser ? "Write a bio ✨" : "New user 😈")}
            </span>
            <span id="profile--bio"></span>
            <div className="stats">
              <div className="friends">
                <span className="largeText">{chatCount}</span>
                Connections
              </div>
            </div>
          </div>
          <div className="modal-buttons">
            {isAnotherUser && showMessageBtn !== false && (
              <button
                className="modal-btn modal--follow"
                onClick={() => handleSelect(currentUser)}
              >
                Message
              </button>
            )}
            {!isAnotherUser && (
              <button
                className="modal-btn modal--follow"
                onClick={handleEditClick}
              >
                Edit profile
              </button>
            )}

            <button className="modal-btn modal--close" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
