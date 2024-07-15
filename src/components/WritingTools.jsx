import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faL, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

const { GoogleGenerativeAI } = require("@google/generative-ai");
const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

const WritingTools = () => {
  const { writingToolsMode, setWritingToolsMode } = useContext(ChatContext);
  const [messageMood, setMessageMood] = useState("");
  const [messageType, setMessageType] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const { resultGlobal, setResultGlobal } = useContext(ChatContext);
  const { aiRefMsg } = useContext(ChatContext);
  const { text, setText } = useContext(ChatContext);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    setText(resultGlobal);
    setWritingToolsMode(false);
  };
  const chatHistory = [
    {
      role: "user",
      parts: [
        {
          text: `you're ${AuthContext.displayName}. you're a ${
            messageMood.toLowerCase() === "reply" ? "reply" : "message"
          } generator. You don't mention that you're an AI, don't ask any questions and don't use markdown. 
          You will form message based on the keyword 'Mood','Mode' and 'Additional' at the end of my messasge. If 'mode' is 'New Message', you don't reply, but generate a message to be sent based on the query and if its some other mode, reply to it. If you can't understand the context, word like a human and concisely. `,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `${
            messageMood.toLowerCase() === "reply"
              ? "Sure. BTW, how are you doing?"
              : "Sure, write away and i will rephrase it into a message for you according to the mood settings."
          }`,
        },
      ],
    },
  ];

  function appendToChatHistory(role, msg) {
    chatHistory.push({
      role: role,
      parts: [{ text: msg }],
    });
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    history: chatHistory,
    generationConfig: {
      maxOutputTokens: 800,
    },
  });

  const geminiSearch = async () => {
    setLoading(true);
    let msg =
      (messageType.toLowerCase() === "new message"
        ? query +
          `\nMessage Mood : ${messageMood}\nMessage Mode : ${messageType}`
        : aiRefMsg?.text.trim() + `\nAdditional: ${query}`) +
      `Message Mood : ${messageMood}\nMessage Mode : ${messageType}`;
    appendToChatHistory("user", msg);

    try {
      const result = await chat.sendMessageStream(msg);
      let text = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        text += chunkText;
      }
      appendToChatHistory("model", text);
      if (msg.trim() !== "") {
        setResult(text);
        setResultGlobal(text);
        setLoading(false);
      }
      // return text;
    } catch (error) {
      setLoading(false);
      console.error(error);
      setResult(error);
      setResultGlobal(error);
    }
    msg = "";
  };

  const handleCloseBtnClick = () => {
    setWritingToolsMode(false);
  };

  useEffect(() => {
    const messageTypeDiv = document.querySelector(".messageType");
    const messageTypeOptions = messageTypeDiv.querySelectorAll("div");
    const messageMoodDiv = document.querySelector(".contextRef");
    const messageMoodOptions = messageMoodDiv.querySelectorAll("div");

    function addHighlight(parentDiv, div, grandparent) {
      div.addEventListener("click", () => {
        parentDiv.forEach((div) => {
          div.classList.remove("highlight");
        });
        div.classList.toggle("highlight");
        if (grandparent.classList.contains("contextRef")) {
          setMessageMood(div.textContent);
        } else if (grandparent.classList.contains("messageType")) {
          setMessageType(div.textContent);
        }
      });
    }

    messageTypeOptions.forEach((div) => {
      addHighlight(messageTypeOptions, div, messageTypeDiv);
    });

    messageMoodOptions.forEach((div) => {
      addHighlight(messageMoodOptions, div, messageMoodDiv);
    });

    return () => {
      messageTypeOptions.forEach((div) => {
        div.removeEventListener("click", () => {});
      });
      messageMoodOptions.forEach((div) => {
        div.removeEventListener("click", () => {});
      });
    };
  }, []);

  return (
    <div className="writing-tools">
      <div className="writingToolsContainer">
        <h2>Writing Tools</h2>

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
        <div className="input__container">
          <div className="shadow__input"></div>
          <button className="input__button__shadow">
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
            className="input__search"
            placeholder="Describe (optional)"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {result && (
          <div className="resultContainer">
            <svg
              height="24"
              width="24"
              fill="#FFFFFF"
              viewBox="0 0 24 24"
              data-name="Layer 1"
              id="Layer_1"
              className="sparkle"
            >
              <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
            </svg>
            {result}
            <div className="resultContainer--buttons">
              {/* <div className="copy">Copy</div> */}
              <div className="sendAiMsg" onClick={handleSend}>
                Copy
              </div>
              <div
                className="delete"
                title="delete"
                onClick={() => setResult("")}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="result"></div>
      <div className="writing-tools--buttons">
        <button className="generate-btn" onClick={geminiSearch}>
          <svg
            height="24"
            width="24"
            fill="#FFFFFF"
            viewBox="0 0 24 24"
            data-name="Layer 1"
            id="Layer_1"
            className="sparkle"
          >
            <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
          </svg>

          <span className="text">
            {loading ? "Cooking your Ai message..." : "Generate"}
          </span>
        </button>
        <button className="close-btn" onClick={handleCloseBtnClick}>
          <FontAwesomeIcon icon={faClose} />
        </button>
      </div>
    </div>
  );
};

export default WritingTools;
