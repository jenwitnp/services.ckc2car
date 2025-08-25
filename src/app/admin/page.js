"use client";

import { useLiffGuest } from "@/app/contexts/LiffGuestProvider";

export default function UserInfoComponent() {
  const {
    getLineUserId,
    getDisplayName,
    isLineUser,
    isAuthenticated,
    lineUser,
    guestUser,
    loginWithLine,
    logoutFromLine,
    isInLineApp,
  } = useLiffGuest();

  const lineUserId = getLineUserId(); // ✅ This gets the LINE User ID!

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">ข้อมูลผู้ใช้</h3>

      {/* ✅ Display LINE User ID */}
      {lineUserId && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p>
            <strong>LINE User ID:</strong> {lineUserId}
          </p>
          <p>
            <strong>Display Name:</strong> {getDisplayName()}
          </p>
          <p>
            <strong>User Type:</strong> {guestUser?.type}
          </p>
        </div>
      )}

      {/* ✅ Show login status */}
      <div className="mb-4">
        <p>
          <strong>In LINE App:</strong> {isInLineApp() ? "Yes" : "No"}
        </p>
        <p>
          <strong>Authenticated:</strong> {isAuthenticated() ? "Yes" : "No"}
        </p>
        <p>
          <strong>Is LINE User:</strong> {isLineUser() ? "Yes" : "No"}
        </p>
      </div>

      {/* ✅ Show full LINE user data if available */}
      {lineUser && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold mb-2">LINE Profile:</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(lineUser, null, 2)}
          </pre>
        </div>
      )}

      {/* ✅ Login/Logout buttons */}
      <div className="space-y-2">
        {isInLineApp() && !isAuthenticated() && (
          <button
            onClick={loginWithLine}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            เข้าสู่ระบบด้วย LINE
          </button>
        )}

        {isAuthenticated() && (
          <button
            onClick={logoutFromLine}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ออกจากระบบ
          </button>
        )}
      </div>

      {/* ✅ Use LINE User ID for API calls */}
      {lineUserId && (
        <button
          onClick={() => {
            // Example: Save customer conversation with LINE User ID
            fetch("/api/v1/line/admin-coversation", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lineUserId: lineUserId,
                adminMessage: "ขอบคุณที่ใช้บริการของเรา",
                adminName: "System",
              }),
            });
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Save Message with LINE ID
        </button>
      )}
    </div>
  );
}
