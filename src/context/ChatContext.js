import React, { createContext, useState, useEffect, useContext, useReducer } from "react";
import { auth } from "../firebase"
import { onAuthStateChanged } from "firebase/auth";
import userEvent from "@testing-library/user-event";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext()


export const ChatContextProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const INITIAL_STATE = {
        chatId: "null",
        user: {},
        isChatVisible: true,
    };

    const chatReducer = (state, action) => {
        switch (action.type) {
            case "CHANGE_USER":
                return {
                    ...state,
                    user: action.payload || null,
                    chatId:
                        currentUser.uid > action.payload.uid
                            ? currentUser.uid + action.payload.uid
                            : action.payload.uid + currentUser.uid,
                };
            case "TOGGLE_CHAT_VISIBILITY":
                return { ...state, isChatVisible: !state.isChatVisible };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    return (
        <ChatContext.Provider value={{ data: state, dispatch }}>
            {children}
        </ChatContext.Provider>
    );
};

