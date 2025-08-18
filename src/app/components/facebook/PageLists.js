import { useFacebook } from "@/app/contexts/FacebookProvider";
import Image from "next/image";
import React from "react";

// Custom loader that simply returns the src (disables Next.js optimization for these images)
const fbImageLoader = ({ src }) => src;

function PageLists({ pages }) {
  const { selectedPage, handleSelectPage } = useFacebook();
  return (
    <div className="text-sm h-full overflow-y-auto overscroll-contain pb-4">
      <p className="mb-3 text-main-400 px-1">กรุณาเลือกเพจ</p>
      <div className="space-y-1">
        {pages.map((page) => {
          const isActive = page.id === selectedPage?.id;
          return (
            <div
              key={page.id}
              className={`flex items-center gap-3 hover:bg-main-600 p-2.5 rounded cursor-pointer transition-colors ${
                isActive ? "bg-main-700" : ""
              }`}
              onClick={() => handleSelectPage(page)}
            >
              <Image
                loader={fbImageLoader}
                width={50}
                height={50}
                src={page.picture?.data?.url}
                alt={page.name}
                className="w-10 h-10 rounded-full object-cover bg-blue-400 flex-shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-white font-medium truncate">{page.name}</p>
                <p className="text-xs text-main-300 truncate">
                  เลือกเพื่อดูการสนทนา
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PageLists;
