import React, { useContext, useState, useEffect } from "react";
import Messages from "./Messages";
import Input from "./Input";
import pfp from "../pfp.jpeg";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const { dispatch } = useContext(ChatContext);

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
            />
            <span>@{data.user?.displayName}</span>
          </div>

          <Messages />
          <Input />
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
