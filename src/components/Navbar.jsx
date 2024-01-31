import React, { useContext, useState } from "react";
import Modal from "./Modal"; // Assuming you have a Modal component

import pfp from "../pfp.jpeg";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleUserClick = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="navbar">
      {/* <span className="logo">Twixt Chat</span> */}
      <div className="user" onClick={handleUserClick}>
        <img src={currentUser.photoURL} alt="" />
        <span className="user-name">{currentUser.displayName}</span>
      </div>
      <button className="btn--log-out" onClick={() => signOut(auth)}>
        Log out
      </button>

      {isModalOpen && <Modal onClose={closeModal} />}
    </div>
  );
};

export default Navbar;
