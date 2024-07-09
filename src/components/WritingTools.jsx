import React, { useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { ChatContext } from "../context/ChatContext";

const WritingTools = () => {
  const { writingToolsMode, setWritingToolsMode } = useContext(ChatContext);

  const handleCloseBtnClick = () => {
    setWritingToolsMode(false);
  };
  useEffect(() => {
    const contextRef = document.querySelector(".contextRef");
    const contextRefOptions = contextRef.querySelectorAll("div");
    const messageType = document.querySelector(".messageType");
    const messageTypeOptions = messageType.querySelectorAll("div");

    function addHighlight(parentDiv, div) {
      div.addEventListener("click", () => {
        parentDiv.forEach((div) => {
          div.classList.remove("highlight");
        });
        div.classList.toggle("highlight");
      });
    }

    contextRefOptions.forEach((div) => {
      addHighlight(contextRefOptions, div);
    });

    messageTypeOptions.forEach((div) => {
      addHighlight(messageTypeOptions, div);
    });

    return () => {
      contextRefOptions.forEach((div) => {
        div.removeEventListener("click", () => {});
      });
    };
  }, []);
  return (
    <div className="writing-tools">
      <div className="writingToolsContainer">
        <h2>Writing Tools</h2>
        <button className="close-btn" onClick={handleCloseBtnClick}>
          <FontAwesomeIcon icon={faClose} />
        </button>
        <div className="messageType">
          <div className="newMessage option">New Message</div>
          <div className="reply option">Reply</div>
        </div>
        <div className="contextRef">
          <div className="friendly option">Friendly</div>
          <div className="professional option">Professional</div>
          <div className="concise option">Concise</div>
        </div>
        <div className="linebreak"></div>
        <div class="input__container">
          <div class="shadow__input"></div>
          <button class="input__button__shadow">
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              height="20px"
              width="20px"
            >
              <path
                d="M4 9a5 5 0 1110 0A5 5 0 014 9zm5-7a7 7 0 104.2 12.6.999.999 0 00.093.107l3 3a1 1 0 001.414-1.414l-3-3a.999.999 0 00-.107-.093A7 7 0 009 2z"
                fill-rule="evenodd"
                fill="#17202A"
              ></path>
            </svg>
          </button>
          <input
            type="text"
            name="text"
            class="input__search"
            placeholder="Describe (optional)"
          />
        </div>
      </div>
      <div className="writing-tools--buttons">
        <button class="generate-btn">
          <svg
            height="24"
            width="24"
            fill="#FFFFFF"
            viewBox="0 0 24 24"
            data-name="Layer 1"
            id="Layer_1"
            class="sparkle"
          >
            <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
          </svg>

          <span class="text">Generate</span>
        </button>
      </div>
    </div>
  );
};

export default WritingTools;
