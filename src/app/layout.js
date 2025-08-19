import "./globals.css";
import ClientLayout from "./components/ClientLayout";

// ✅ This can be exported from server components
export const metadata = {
  title: "Ckc2car Ai data center",
  description: "ศูนย์บริการข้อมูลบริษัทโชคคูณโชค",
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          async
        ></script>
      </head>
      <body className="flex h-screen overflow-auto">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
