import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Search from "./Search";
import Chats from "./Chats";
import { ChatContext } from "../context/ChatContext";

const Sidebar = () => {
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
      className={`sidebar ${
        isMobile ? (data.isChatVisible ? "hidden" : "visible") : null
      }`}
    >
      <Navbar />
      <div className="sidebarContainer">
        <Search />
        <Chats />
      </div>
    </div>
  );
};

export default Sidebar;
