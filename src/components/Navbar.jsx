import React, { useContext, useEffect, useState } from "react";
import Modal from "./UserProfileModal"; // Assuming you have a Modal component
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGear,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { ChatContext } from "../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentUserChats, setCurrentUserChats] = useState([]);
  const [chatCount, setChatCount] = useState(0);
  const { writingToolsMode, setWritingToolsMode } = useContext(ChatContext);

  const toggleWritingTools = () => {
    setWritingToolsMode(!writingToolsMode);
    // toast.success("Open a chat to get started with Ai tools");
  };

  const handleProfileClick = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setTimeout(() => {
      setModalOpen(false);
    }, 100);
  };

  useEffect(() => {
    if (currentUser.uid) {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setCurrentUserChats(doc.data());
        setChatCount(Object.keys(doc.data() || {}).length);
      });

      return () => {
        unsub();
      };
    }
  }, [currentUser]);

  return (
    <div className="navbar">
      {/* <span className="logo">Twixt Chat</span> */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="user" onClick={handleProfileClick}>
        <img src={currentUser.photoURL} alt="" />
        <span className="user-name">Profile</span>
      </div>
      <div className="linebreak"></div>
      <div className="nav-items">
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
        <button onClick={handleProfileClick}>
          <FontAwesomeIcon icon={faUser} />
        </button>
        <button>
          <FontAwesomeIcon icon={faGear} />
        </button>
      </div>
      <button className="btn--log-out" onClick={() => signOut(auth)}>
        Log out
      </button>
      {isModalOpen && (
        <Modal
          onClose={closeModal}
          userProfile={currentUser}
          chatCount={chatCount}
        />
      )}
    </div>
  );
};

export default Navbar;
