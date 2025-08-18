"use client";
import { createContext, useContext, useState, useEffect } from "react";

const UserSessionContext = createContext(undefined);

export const UserSessionProvider = ({ children }) => {
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("rememberedUser");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
  }, []);

  const setUser = (user) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("rememberedUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("rememberedUser");
    }
  };

  return (
    <UserSessionContext.Provider value={{ user, setUser }}>
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return context;
};
