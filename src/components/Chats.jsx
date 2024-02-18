import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import Modal from "./Modal";

const Chats = () => {
  const { data } = useContext(ChatContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const [profileOfSelectedUser, setProfileOfSelectedUser] = useState({});
  const [selectedUserChats, setSelectedUserChats] = useState([]);
  const [chatCount, setChatCount] = useState(0);

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

  useEffect(() => {
    if (profileOfSelectedUser.uid) {
      const unsub = onSnapshot(
        doc(db, "userChats", profileOfSelectedUser.uid),
        (doc) => {
          setSelectedUserChats(doc.data());
          setChatCount(Object.keys(doc.data() || {}).length);
        }
      );

      return () => {
        unsub();
      };
    }
  }, [profileOfSelectedUser]);

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

  const closeModal = () => {
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
        <Modal
          onClose={closeModal}
          userProfile={profileOfSelectedUser}
          chatCount={chatCount}
        />
      )}
    </div>
  );
};

export default Chats;
