import React, { useContext, useState, useEffect } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import Modal from "./UserProfileModal";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import WritingTools from "./WritingTools";
import { motion, AnimatePresence } from "framer-motion";

const Chat = () => {
  const [chatCount, setChatCount] = useState(0);
  const [selectedUserChats, setSelectedUserChats] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const { data } = useContext(ChatContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const { dispatch } = useContext(ChatContext);
  const { writingToolsMode } = useContext(ChatContext);

  const closeModal = () => {
    setModalOpen(false);
  };

  const openUserProfileModal = () => {
    setModalOpen(true);
  };

  useEffect(() => {
    if (data.user?.uid) {
      const unsub = onSnapshot(doc(db, "userChats", data.user?.uid), (doc) => {
        setSelectedUserChats(doc.data());
        setChatCount(Object.keys(doc.data() || {}).length);
      });

      return () => {
        unsub();
      };
    }
  }, [data.user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`chat ${
        isMobile ? (data.isChatVisible ? "visible" : "hidden") : null
      }`}
    >
      {data.user.photoURL ? (
        <>
          <div className="chatInfo">
            <div
              className="btn--back"
              onClick={() => dispatch({ type: "TOGGLE_CHAT_VISIBILITY" })}
            >
              &lt;
            </div>
            <img
              src={
                data.user?.photoURL ||
                "https://freepngimg.com/save/130401-t-letter-free-download-png-hq/512x512"
              }
              alt=""
              onClick={openUserProfileModal}
            />
            <span>@{data.user?.displayName}</span>
          </div>

          <Messages />
          <AnimatePresence>
            {writingToolsMode && (
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 50 }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ ease: "linear", duration: 0.2 }}
              >
                <WritingTools />
              </motion.div>
            )}
          </AnimatePresence>
          <Input />
          {isModalOpen && (
            <Modal
              onClose={closeModal}
              userProfile={data.user}
              chatCount={chatCount}
              showMessageBtn={false}
            />
          )}
        </>
      ) : (
        <div className="default-modal">
          <div className="modal-container">
            <img
              className="chat-icon"
              src="https://static.vecteezy.com/system/resources/previews/009/663/416/original/speech-bubble-talk-bubble-chat-bubble-icon-transparent-free-png.png"
              alt=""
            />
            <h2>Start a conversation!</h2>
            <div
              className="btn--get-started"
              onClick={() => dispatch({ type: "TOGGLE_CHAT_VISIBILITY" })}
            >
              Get Started
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
