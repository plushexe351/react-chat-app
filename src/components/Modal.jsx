import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Modal = ({ onClose, children }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="user-profile" onClick={onClose}>
      <div className="modal">
        <h4>Your Profile</h4>
        <div className="profile-info">
          <img src={currentUser.photoURL} alt="" />
          <span id="profile--user-name">{currentUser.displayName}</span>
          <span id="profile--email">{currentUser.email}</span>
        </div>
        <button className="modal-close" onClick={onClose}>
          close
        </button>
      </div>
    </div>
  );
};

export default Modal;
