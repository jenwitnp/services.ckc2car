import "./globals.css";
import ClientLayout from "./components/ClientLayout";

// ✅ This can be exported from server components
export const metadata = {
  title: "Ckc2car Ai data center",
  description: "ศูนย์บริการข้อมูลบริษัทโชคคูณโชค",

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="flex  bg-main-900 mx-auto h-screen overflow-auto">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
