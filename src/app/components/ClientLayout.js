"use client";

import { SessionProvider } from "next-auth/react";
import ReactQueryProvider from "../contexts/ReactQueryProvider";
import SessionWrapper from "./SessionWrapper";
import RootLayoutClient from "./RootLayoutClient";
import { UserSessionProvider } from "../contexts/UserSessionProvider";
import { ModalProvider } from "../contexts/ModalProvider";
import { CarParamsProvider } from "../contexts/CarParamsProvider";
import { LiffGuestProvider } from "../contexts/LiffGuestProvider"; // ✅ Add LIFF Guest Provider

export default function ClientLayout({ children }) {
  return (
    <ReactQueryProvider>
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
