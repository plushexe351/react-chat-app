import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Chats = () => {
  const { data } = useContext(ChatContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const [profileOfSelectedUser, setProfileOfSelectedUser] = useState();

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  console.log(Object.entries(chats));

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
    dispatch({ type: "TOGGLE_CHAT_VISIBILITY" });
    console.log(data.isChatVisible);
    console.log();
  };

  const openUserProfileModal = (e, u) => {
    e.stopPropagation();
    setProfileOfSelectedUser(u);
    setModalOpen(true);
  };

  const onClose = () => {
    setModalOpen(false);
  };
  return (
    <div className="chats">
      <h1>Chats</h1>
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((chat) => (
          <div
            className="userChat"
            key={chat[0]}
            onClick={() => handleSelect(chat[1].userInfo)}
          >
            <img
              src={chat[1].userInfo.photoURL}
              alt=""
              onClick={(e) => openUserProfileModal(e, chat[1].userInfo)}
            />
            <div className="userChatInfo">
              <span>{chat[1].userInfo.displayName}</span>
              <p>{chat[1].lastMessage?.text}</p>
            </div>
          </div>
        ))}
      {isModalOpen && (
        <div className="user-profile" onClick={onClose}>
          <div className="modal">
            <h4>{profileOfSelectedUser.displayName}'s Profile</h4>
            <div className="gradientBg">
              <img src={profileOfSelectedUser.photoURL} alt="" />
            </div>
            <div className="profile-info">
              <img src={profileOfSelectedUser.photoURL} alt="" />
              <span id="profile--user-name">
                {profileOfSelectedUser.displayName}
              </span>
              <span id="profile--email">{profileOfSelectedUser.email}</span>
            </div>
            <div className="modal-buttons">
              <button className="modal-btn modal--follow">Follow</button>
              <button className="modal-btn modal--close" onClick={onClose}>
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
