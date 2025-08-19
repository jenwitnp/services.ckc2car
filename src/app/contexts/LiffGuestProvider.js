"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useLiffAutoLogin } from "../hooks/useLiffAutoLogin";

const LiffGuestContext = createContext({});

export function LiffGuestProvider({ children }) {
  const { isLiffApp, guestUser, liffData } = useLiffAutoLogin();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isLiffApp && guestUser) {
      // Check if guest user is stored in localStorage
      const storedUser = localStorage.getItem("liff_guest_user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error("Error parsing stored guest user:", error);
          setCurrentUser(guestUser);
        }
      } else {
        setCurrentUser(guestUser);
      }
    }
  }, [isLiffApp, guestUser]);

  const loginAsGuest = () => {
    if (guestUser) {
      localStorage.setItem("liff_guest_user", JSON.stringify(guestUser));
      setCurrentUser(guestUser);
      return guestUser;
    }
    return null;
  };

  const logoutGuest = () => {
    localStorage.removeItem("liff_guest_user");
    setCurrentUser(null);
  };

  return (
    <LiffGuestContext.Provider
      value={{
        isLiffApp,
        guestUser: currentUser,
        liffData,
        loginAsGuest,
        logoutGuest,
        isGuestLoggedIn: !!currentUser,
      }}
    >
      {children}
    </LiffGuestContext.Provider>
  );
}

export const useLiffGuest = () => {
  const context = useContext(LiffGuestContext);
  if (!context) {
    throw new Error("useLiffGuest must be used within LiffGuestProvider");
  }
  return context;
};
