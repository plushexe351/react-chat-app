import React, { useContext, useState } from "react";
import Attach from "../attach.png";
import {
  Timestamp,
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [fileMessage, setFileMessage] = useState("");
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const { writingToolsMode, setWritingToolsMode } = useContext(ChatContext);

  const toggleWritingTools = () => {
    setWritingToolsMode(!writingToolsMode);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setImg(selectedFile);

    if (selectedFile) {
      setFileMessage("Image selected");
    } else {
      setFileMessage("");
    }
  };

  const handleKeyDown = (e) => {
    e.code === "Enter" && handleSend();
  };

  const handleSend = async () => {
    setText("");

    if (img) {
      const compressedFile = await compressImage(img);
      if (!compressedFile) {
        setFileMessage("Error compressing the image. Please try again...");
        return;
      }

      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on(
        (error) => {
          setFileMessage("Error uploading file. Please try again...");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setFileMessage("");
    setImg(null);
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 800;
          const maxHeight = 600;
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
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="input">
      <div className="send">
        <input
          type="file"
          style={{ display: "none" }}
          name=""
          id="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file">
          <img src={Attach} alt="" />
        </label>
      </div>

      <input
        type="text"
        placeholder="Type something..."
        name=""
        id=""
        onChange={(e) => setText(e.target.value)}
        value={text}
        onKeyDown={handleKeyDown}
      />
      {fileMessage && <div className="file-message">{fileMessage}</div>}
      <button class="ai-btn" onClick={toggleWritingTools}>
        <svg
          height="24"
          width="24"
          fill="#FFFFFF"
          viewBox="0 0 24 24"
          data-name="Layer 1"
          id="Layer_1"
          class="sparkle"
        >
          <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
        </svg>

        {/* <span>Generate</span> */}
      </button>
      <div className="writingToolsActivate"></div>
      <div className="send">
        <button onClick={handleSend}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      </div>
    </div>
  );
};

export default Input;
