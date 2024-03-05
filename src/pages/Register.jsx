import React, { useContext, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db, auth, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import tanjiropfp from "../assets/tanjiropfp.jpg";
import saitamapfp from "../assets/saitamapfp.jpg";
import batmanpfp from "../assets/batmanpfp.jpg";
import narutopfp from "../assets/narutopfp.jpeg";
import luffypfp from "../assets/luffypfp.jpeg";

import userEvent from "@testing-library/user-event";

const Register = () => {
  const { dispatch } = useContext(ChatContext);
  const [img, setImg] = useState("");
  const [fileMessage, setFileMessage] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false); // New state for loader
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setImg(selectedFile);

    if (selectedFile) {
      setFileMessage("Avatar uploaded");
    } else {
      setFileMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = e.target[0].value.toLowerCase().trim();
    const email = e.target[1].value;
    const password = e.target[2].value;
    const selectedFile = img;

    // Check if the username has at least 2 digits
    if (!/\d{2,}/.test(displayName)) {
      setErr("Username must have at least 5 characters and 2 digits");
      return;
    }

    // Compress the image if it exceeds 100KB
    if (selectedFile && selectedFile.size > 100 * 1024) {
      const compressedFile = await compressImage(selectedFile);
      if (!compressedFile) {
        setErr("Failed to compress the image");
        return;
      }
      // Use the compressed file for uploading
      uploadFile(compressedFile, displayName, email, password);
    } else {
      // Use the original file for uploading
      uploadFile(selectedFile, displayName, email, password);
    }
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
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file, displayName, email, password) => {
    setLoading(true); // Show loader

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      let photoURL;

      if (file) {
        const storageRef = ref(storage, displayName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Handle progress (if needed)
          },
          (error) => {
            console.error("Error uploading file:", error);
            setErr(true);
            setLoading(false); // Hide loader on error
          },
          async () => {
            photoURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Check if photoURL is undefined and set a default URL if needed
            if (!photoURL) {
              photoURL = getRandomImageURL(); // or any other default URL
            }

            // Update profile with displayName and photoURL
            await updateProfile(res.user, {
              displayName,
              photoURL,
            });

            // Set user document in the "users" collection
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              searchName: displayName.toLowerCase(),
              email,
              photoURL,
            });

            // Set user document in the "userChats" collection
            await setDoc(doc(db, "userChats", res.user.uid), {});

            // Dispatch action to update chat user in context
            dispatch({
              type: "CHANGE_USER",
              payload: {},
            });

            // Navigate to the home page
            navigate("/");
          }
        );
      } else {
        // If no file is uploaded, generate a random image URL
        photoURL = getRandomImageURL();

        // Update profile with displayName and photoURL
        await updateProfile(res.user, {
          displayName,
          photoURL,
        });

        // Set user document in the "users" collection
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName,
          email,
          photoURL,
        });

        // Set user document in the "userChats" collection
        await setDoc(doc(db, "userChats", res.user.uid), {});

        // Dispatch action to update chat user in context
        dispatch({
          type: "CHANGE_USER",
          payload: {},
        });

        // Navigate to the home page
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setErr(true);
      setLoading(false); // Hide loader on error
    }
  };

  const getRandomImageURL = () => {
    const randomImages = [
      narutopfp,
      luffypfp,
      batmanpfp,
      saitamapfp,
      tanjiropfp,
      // Add more image URLs as needed
    ];
    const randomIndex = Math.floor(Math.random() * randomImages.length);
    return randomImages[randomIndex];
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Twixt Chat</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <label htmlFor="file">
            <img
              src="https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/batman_hero_avatar_comics-512.png"
              alt=""
            />
            <span>Add avatar</span>
          </label>
          {fileMessage && (
            <div className="fileMessage">
              {" "}
              <FontAwesomeIcon className="fa-icon" icon={faCheck} />
              {fileMessage}
            </div>
          )}
          <input type="text" placeholder="username" name="" id="" />
          <input type="email" placeholder="email" name="" id="" />
          <input type="password" placeholder="password" name="" id="" />
          <input
            type="file"
            name=""
            id="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button disabled={loading}>
            {loading ? (
              <div className="loading-progress register"></div>
            ) : (
              <div className="btn">Register</div>
            )}
          </button>
          {err && (
            <span
              style={{
                color: "darkmagenta",
                textAlign: "center",
                fontSize: "0.8rem",
              }}
            >
              {err}
            </span>
          )}
        </form>
        <p>
          Already have an account?
          <Link className="link" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
