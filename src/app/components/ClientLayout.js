"use client";

import { SessionProvider } from "next-auth/react";
import ReactQueryProvider from "../contexts/ReactQueryProvider";
import SessionWrapper from "./SessionWrapper";
import RootLayoutClient from "./RootLayoutClient";
import { UserSessionProvider } from "../contexts/UserSessionProvider";
import { ModalProvider } from "../contexts/ModalProvider";
import { CarParamsProvider } from "../contexts/CarParamsProvider";
import { useLiffAutoLogin } from "../hooks/useLiffAutoLogin";

function LiffWrapper({ children }) {
  const { isLiffApp, isLoading } = useLiffAutoLogin();

  // Don't render children until LIFF is initialized
  if (isLiffApp && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">เตรียมแอป...</p>
        </div>
      </div>
    );
  }

  return children;
}

export default function ClientLayout({ children }) {
  return (
    <ReactQueryProvider>
      <SessionWrapper>
        <SessionProvider>
          <UserSessionProvider>
            <LiffWrapper>
              <ModalProvider>
                <CarParamsProvider>
                  <RootLayoutClient>{children}</RootLayoutClient>
                </CarParamsProvider>
              </ModalProvider>
            </LiffWrapper>
          </UserSessionProvider>
        </SessionProvider>
      </SessionWrapper>
    </ReactQueryProvider>
  );
}
