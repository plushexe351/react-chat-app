import React, { useContext, useEffect, useState } from "react";
import pfp from "../pfp.jpeg";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
  orderBy,
  startAt,
  endAt,
  onSnapshot,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal";

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const changeUser = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  const handleSearch = async () => {
    const lowercaseUsername = username.toLowerCase();
    const q = query(
      collection(db, "users"),
      orderBy("displayName") || orderBy("searchName"),
      startAt(lowercaseUsername),
      endAt(lowercaseUsername + "\uf8ff")
    );

    try {
      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });

      setUser(users);
    } catch (err) {
      setErr(true);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };
  const handleSelect = async (founduser) => {
    dispatch({ type: "TOGGLE_CHAT_VISIBILITY" });

    const combinedId =
      currentUser.uid > founduser.uid
        ? currentUser.uid + founduser.uid
        : founduser.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: founduser.uid,
            displayName: founduser.displayName,
            photoURL: founduser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
        await updateDoc(doc(db, "userChats", founduser.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
      changeUser(founduser);
    } catch (err) {}

    setUser(null);
    setUsername("");
  };
  const handleChange = (e) => {
    setUsername(e.target.value);
    console.log(username);
    e.target.value ? handleSearch() : setUsername("");
  };
  return (
    <div className="search">
      <div className="searchForm">
        <img
          className="search-icon"
          src="https://www.freeiconspng.com/thumbs/search-icon-png/search-icon-png-21.png"
          alt=""
          onClick={handleSearch}
        />
        <input
          type="text"
          name=""
          id=""
          placeholder="Find a user"
          onKeyDown={handleKey}
          onChange={handleChange}
          value={username}
        />
      </div>
      {err && (
        <span style={{ color: "lightgray", fontSize: "0.7rem" }}>
          Something went wrong!
        </span>
      )}
      {user && (
        <div>
          {user.map((foundUser) => (
            <div className="userChat" key={foundUser.uid}>
              <div
                className="add-friend"
                onClick={() => handleSelect(foundUser)}
              >
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              <img src={foundUser.photoURL} alt="" />
              <div className="userChatInfo">
                <span>{foundUser.displayName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
