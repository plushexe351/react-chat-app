import React, { useContext, useState } from "react";
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
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

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
      where("displayName", ">=", lowercaseUsername),
      where("displayName", "<=", lowercaseUsername + "\uf8ff")
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
    e.code == "Enter" && handleSearch();
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
    e.target.value ? handleSearch() : setUser(null);
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
      {err && <span>Something went wrong!</span>}
      {user && (
        <div>
          {user.map((foundUser) => (
            <div className="userChat" key={foundUser.uid}>
              <img src={foundUser.photoURL} alt="" />
              <div className="userChatInfo">
                <span>{foundUser.displayName}</span>
              </div>
              <div
                className="add-friend"
                title="Add friend"
                onClick={() => handleSelect(foundUser)}
              >
                +
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
