"use client";
import { Bell, LogOut, Settings, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { DropdownMenu } from "./ui/DropdownMenu";
import { signOut } from "next-auth/react";
import { useState } from "react";

// ✅ Create ProfileAvatar component for better image handling
const ProfileAvatar = ({ session, size = 32, isMobile = false }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = session?.user?.image;
  const userName = session?.user?.name || "Guest";

  const isFacebookImage =
    imageUrl &&
    (imageUrl.includes("fbcdn.net") || imageUrl.includes("fbsbx.com"));

  // ✅ Default avatar fallback
  const DefaultAvatar = () => (
    <div
      className="rounded-full bg-gradient-to-br from-main-600 to-main-700 flex items-center justify-center text-main-200 font-semibold border-2 border-main-500"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {userName.charAt(0).toUpperCase()}
    </div>
  );

  // ✅ If no image URL or error occurred, show default avatar
  if (!imageUrl || imageError) {
    return <DefaultAvatar />;
  }

  const handleLogout = () => {
    document.cookie = "linkUserId=; path=/; max-age=0";
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Image
      src={imageUrl}
      alt={`${userName} profile`}
      width={size}
      height={size}
      className="rounded-full object-cover border-2 border-main-500"
      unoptimized={isFacebookImage}
      onError={(e) => {
        console.log("Profile image failed to load:", imageUrl);
        setImageError(true);
      }}
      onLoad={() => setImageError(false)}
      priority={false}
    />
  );
};

export default function Header() {
  const { data: sessionData } = useSession({
    required: false,
  });

  const session = sessionData;

  return (
    <header className="w-full flex flex-col md:flex-row items-start md:items-center justify-between px-4 sm:px-6 md:px-8 py-4 md:py-6 bg-main-800 border-b border-main-700 gap-4">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            CKC2CAR SERVICES
          </h1>
          <p className="text-xs sm:text-sm text-main-400">
            ระบบบริหารจัดการลูกค้าบริษัทโชคคูณโชค
          </p>
        </div>

        {/* Mobile Profile - Only visible on mobile */}
        <div className="md:hidden">
          {session ? (
            <ProfileDisplay session={session} isMobile={true} />
          ) : null}
        </div>
      </div>

      {/* Hide this part on mobile */}
      <div className="hidden md:flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="รหัสรถ ยี่ห้อ รุ่น อื่นๆ..."
            className="bg-main-800 text-main-200 w-full md:w-auto rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="absolute left-3 top-2.5 text-main-400">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            className="relative rounded-full p-2 bg-main-800 text-main-400 hover:text-primary-400 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>
          <button
            className="rounded-full p-2 bg-main-800 text-main-400 hover:text-primary-400 transition-colors"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Desktop Profile - Only visible on desktop */}
          <div className="hidden md:block">
            {session ? (
              <ProfileDisplay session={session} isMobile={false} />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

// ✅ Updated ProfileDisplay using new ProfileAvatar component
const ProfileDisplay = ({ session, isMobile = false }) => {
  const handleLogout = () => {
    document.cookie = "linkUserId=; path=/; max-age=0";
    signOut({ callbackUrl: "/login" });
  };
  const items = [
    {
      icon: <LogOut size={16} />,
      label: "ออกจากระบบ",
      onClick: () => handleLogout(),
    },
  ];

  return (
    <DropdownMenu
      trigger={
        <div
          className={`flex items-center gap-2 ${
            !isMobile ? "ml-2" : ""
          } cursor-pointer hover:bg-main-800 rounded-lg p-1 transition-colors`}
        >
          <ProfileAvatar
            session={session}
            size={isMobile ? 28 : 32}
            isMobile={isMobile}
          />

          {!isMobile && (
            <span className="text-main-200 font-medium hidden sm:inline">
              {session?.user?.name || "Guest"}
            </span>
          )}
          <ChevronDown size={isMobile ? 16 : 18} className="text-main-400" />
        </div>
      }
      items={items}
    />
  );
};
