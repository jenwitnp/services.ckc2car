import "./globals.css";

import ReactQueryProvider from "./contexts/ReactQueryProvider";
import SessionWrapper from "./components/SessionWrapper";
import RootLayoutClient from "./components/RootLayoutClient";
import { UserSessionProvider } from "./contexts/UserSessionProvider";

import { ModalProvider } from "./contexts/ModalProvider";
import { CarParamsProvider } from "./contexts/CarParamsProvider";

export const metadata = {
  title: "Admin Dashboard",
};

export default function RootLayout(props) {
  const { children } = props;
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <ReactQueryProvider>
        <SessionWrapper>
          <body className="flex h-screen overflow-auto">
            <UserSessionProvider>
              <ModalProvider>
                <CarParamsProvider>
                  <RootLayoutClient>{children}</RootLayoutClient>
                </CarParamsProvider>
              </ModalProvider>
            </UserSessionProvider>
          </body>
        </SessionWrapper>
      </ReactQueryProvider>
    </html>
  );
}
