"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";

export default function RootLayoutClient(props) {
  const { children } = props;
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <>
      {/* <Sidebar /> */}
      <main className="flex-1 flex flex-col bg-main-900  w-screen h-fit">
        <Header />
        <div className="flex p-0 sm:p-4 mx-auto md:p-6">{children}</div>
      </main>
    </>
  );
}
