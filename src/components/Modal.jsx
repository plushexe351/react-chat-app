import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Modal = ({ onClose, userProfile, chatCount, showMessageBtn }) => {
  console.log(`this is ${chatCount}`);
  const { dispatch } = useContext(ChatContext);
  const currentUserContext = useContext(AuthContext);
  const currentUser = userProfile || currentUserContext.currentUser;
  const isAnotherUser = userProfile !== currentUserContext.currentUser;

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
    dispatch({ type: "TOGGLE_CHAT_VISIBILITY" });
    console.log();
  };
  return (
    <div className="user-profile" onClick={onClose}>
      <div className="modal">
        <h4>{currentUser.displayName}'s Profile</h4>
        <div className="gradientBg">
          <img src={currentUser.photoURL} alt="" />
        </div>
        <div className="profile-info">
          <img src={currentUser.photoURL} alt="" />
          <span id="profile--user-name">@{currentUser.displayName}</span>
          <span id="profile--email">{currentUser.email}</span>
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
          <button className="modal-btn modal--close" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
