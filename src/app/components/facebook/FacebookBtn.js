"use client";
import { signIn, useSession } from "next-auth/react";

import Button from "../ui/Button";
import FbMessenger from "./FbMessenger";

export default function FacebookBtn() {
  const { data: session } = useSession();
  // You can check if the session has a Facebook access token or provider info
  const isFacebookConnected =
    session?.provider === "facebook" ||
    (session?.user && session.user.facebookId);

  return (
    <div className="w-full  mx-auto">
      {!isFacebookConnected ? (
        <div className="w-full h-screen flex items-center justify-center mx-auto">
          <div className="flex-1 flex justify-center items-center">
            <Button
              variant="primary"
              size="md"
              onClick={() => signIn("facebook")}
              // className="w-full md:w-auto flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#ffffff"
                stroke="currentColor"
                strokeWidth="0"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              เชื่อมต่อเฟสบุ๊ค
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-fit mx-auto">
          <FbMessenger />
        </div>
      )}
    </div>
  );
}
