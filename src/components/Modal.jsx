import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Modal = ({ onClose, children }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="user-profile" onClick={onClose}>
      <div className="modal">
        <h4>Your Profile</h4>
        <div className="gradientBg">
          <img src={currentUser.photoURL} alt="" />
        </div>
        <div className="profile-info">
          <img src={currentUser.photoURL} alt="" />
          <span id="profile--user-name">{currentUser.displayName}</span>
          <span id="profile--email">{currentUser.email}</span>
        </div>
        <div className="modal-buttons">
          <button className="modal-close" onClick={onClose}>
            close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
