import React, { useContext, useEffect, useState } from "react";
import Modal from "./UserProfileModal"; // Assuming you have a Modal component
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentUserChats, setCurrentUserChats] = useState([]);
  const [chatCount, setChatCount] = useState(0);

  const handleUserClick = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
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
      <div className="user" onClick={handleUserClick}>
        <img src={currentUser.photoURL} alt="" />
        <span className="user-name">@{currentUser.displayName}</span>
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
