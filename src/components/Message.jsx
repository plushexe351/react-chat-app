import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message }) => {
  const [dateShow, setDateShow] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const [shouldScrollIntoView, setShouldScrollIntoView] = useState(true);
  const messageRef = useRef(null);

  useEffect(() => {
    if (shouldScrollIntoView && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
      setShouldScrollIntoView(false);
    }
  }, [message, shouldScrollIntoView]);

  const handleMessageClick = () => {
    setShouldScrollIntoView(true);
    setDateShow((prevIsClicked) => !prevIsClicked);
  };

  const formatTimeDifference = (timestamp) => {
    const now = new Date();
    const messageDate = timestamp.toDate();

    const timeDifference = now - messageDate;
    const secondsDifference = Math.floor(timeDifference / 1000);

    if (secondsDifference < 60) {
      return `Just Now`;
    } else {
      return `${
        message.date.toDate().getHours() < 10
          ? "0" + message.date.toDate().getHours()
          : message.date.toDate().getHours()
      }:${
        message.date.toDate().getMinutes() < 10
          ? "0" + message.date.toDate().getMinutes()
          : message.date.toDate().getMinutes()
      }`;
    }
  };

  return (
    <div
      ref={messageRef}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
      onClick={handleMessageClick}
    >
      {dateShow && (
        <span className="date">{formatTimeDifference(message.date)}</span>
      )}
      <div className="messageContent">
        {message.text.trim() && <p>{message.text}</p>}
        {message.img && <img src={message.img} alt="" />}
      </div>
    </div>
  );
};

export default Message;
