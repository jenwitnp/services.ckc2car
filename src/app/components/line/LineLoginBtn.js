"use client";
import React from "react";
import Button from "../ui/Button";
import { signIn } from "next-auth/react";

export default function LineLoginBtn() {
  const handleLogin = async () => {
    await signIn("line", { callbackUrl: "/" });
  };

  return (
    <div className="flex">
      <Button
        type="button"
        onClick={handleLogin}
        variant="secondary"
        size="md"
        fit
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16.7,14.3c-0.3-0.2-1-0.5-1.2-0.6c-0.2-0.1-0.3,0-0.5,0.2c-0.2,0.2-0.6,0.8-0.7,0.9c-0.1,0.1-0.2,0.1-0.4,0s-0.8-0.3-1.5-0.9c-0.7-0.6-1.2-1.4-1.3-1.6c-0.1-0.2,0-0.3,0.1-0.4C11.4,11,11.5,10.9,11.6,10.7c0.1-0.1,0.1-0.2,0-0.4c-0.1-0.2-0.6-1.4-0.8-2C10,8.1,9.9,8.2,9.8,8.2H9.3c-0.2,0-0.4,0.1-0.5,0.2c-0.1,0.1-0.5,0.5-0.5,1.2c0,0.7,0.5,1.4,0.6,1.5c0.1,0.1,0.8,1.3,2,2.3c1.2,1,1.6,1.2,1.9,1.3c0.3,0.1,0.6,0.1,0.8,0c0.2-0.1,1-0.5,1.2-0.9c0.2-0.4,0.2-0.8,0.1-0.9C17,14.4,16.9,14.4,16.7,14.3z M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20.5c-4.7,0-8.5-3.8-8.5-8.5S7.3,3.5,12,3.5s8.5,3.8,8.5,8.5S16.7,20.5,12,20.5z" />
        </svg>
        เข้าสู่ระบบด้วย LINE
      </Button>
    </div>
  );
}
