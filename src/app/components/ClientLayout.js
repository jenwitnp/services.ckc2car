"use client";

import { SessionProvider } from "next-auth/react";
import ReactQueryProvider from "../contexts/ReactQueryProvider";
import SessionWrapper from "./SessionWrapper";
import RootLayoutClient from "./RootLayoutClient";
import { UserSessionProvider } from "../contexts/UserSessionProvider";
import { ModalProvider } from "../contexts/ModalProvider";
import { CarParamsProvider } from "../contexts/CarParamsProvider";
import { LiffGuestProvider } from "../contexts/LiffGuestProvider"; // ✅ Add LIFF Guest Provider
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }) {
  return (
    <ReactQueryProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <SessionWrapper>
        <SessionProvider>
          <LiffGuestProvider>
            {/* ✅ Wrap with LIFF Guest Provider */}
            <UserSessionProvider>
              <ModalProvider>
                <CarParamsProvider>
                  <RootLayoutClient>{children}</RootLayoutClient>
                </CarParamsProvider>
              </ModalProvider>
            </UserSessionProvider>
          </LiffGuestProvider>
        </SessionProvider>
      </SessionWrapper>
    </ReactQueryProvider>
  );
}
