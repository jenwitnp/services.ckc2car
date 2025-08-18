import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Check } from "lucide-react";
import { useFacebook } from "@/app/contexts/FacebookProvider";
import { existCustomer } from "@/app/services/ckc/customer";

function ChatLists() {
  const {
    handleSelectConversation,
    conversationsPages,
    selectedPage,
    selectedConversation,
    fetchNextConversations,
    hasNextConversations,
    isFetchingNextConversations,
  } = useFacebook();

  const queryClient = useQueryClient();

  const [_, forceUpdate] = useState(0);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.query?.queryKey?.[0] === "exist-customer" &&
        event.type === "updated"
      ) {
        forceUpdate((n) => n + 1);
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  // Flatten all conversations from all pages
  const conversations = useMemo(() => {
    if (!conversationsPages?.pages) return [];

    // Filter out any undefined pages or data
    try {
      const validPages = conversationsPages.pages.filter(
        (page) => page && page.data
      );
      return validPages
        .flatMap((page) => page.data)
        .filter((chat) => chat != null);
    } catch (error) {
      console.error("Error processing conversations:", error);
      return [];
    }
  }, [conversationsPages]);

  // Track which sender IDs have already been prefetched
  const prefetchedSenderIds = useRef(new Set());

  useEffect(() => {
    // Check if conversations is undefined or null first
    if (!conversations || !Array.isArray(conversations)) return;

    conversations.forEach((chat) => {
      if (!chat || !chat.senders || !chat.senders.data) return;

      const sender = chat.senders.data[0];
      if (sender?.id && !prefetchedSenderIds.current.has(sender.id)) {
        prefetchedSenderIds.current.add(sender.id);
        queryClient.prefetchQuery({
          queryKey: ["exist-customer", sender.id],
          queryFn: () => existCustomer({ field: "facebook_id", id: sender.id }),
          staleTime: 5 * 60 * 1000,
        });
      }
    });
  }, [conversations, queryClient]);

  const scrollRef = useRef(null);

  // Infinite scroll: fetch next conversations when scrolled to bottom
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        hasNextConversations &&
        !isFetchingNextConversations
      ) {
        fetchNextConversations();
      }
    },
    [fetchNextConversations, hasNextConversations, isFetchingNextConversations]
  );

  // Early return if the conversation pages data structure is completely undefined
  if (!conversationsPages) {
    return (
      <div className="text-sm h-full flex items-center justify-center">
        <p className="text-gray-400">ไม่สามารถโหลดข้อมูลการสนทนาได้</p>
      </div>
    );
  }

  return (
    <div
      className="text-sm h-full overflow-y-auto overscroll-contain"
      ref={scrollRef}
      onScroll={handleScroll}
    >
      <p className="mb-3 text-white font-medium px-1">
        {selectedPage?.name || "ประวัติการสนทนา"}{" "}
      </p>
      <div className="space-y-1.5">
        {!conversations || !Array.isArray(conversations) ? (
          <div className="text-center p-4 text-gray-400">
            ไม่มีข้อมูลการสนทนา
          </div>
        ) : (
          conversations.map((chat) => {
            if (!chat) return null;
            const sender = chat?.senders?.data?.[0] || "";
            const isActive = selectedConversation?.id === chat?.id;

            // Read from cache (no hook, just a function call)
            const existData = sender?.id
              ? queryClient.getQueryData(["exist-customer", sender.id])
              : undefined;

            let avatarClass = "bg-main-400"; // default loading color
            if (existData) {
              avatarClass =
                existData.status === "ok" ? "bg-primary-700" : "bg-success-700";
            }

            return (
              <div
                key={chat.id}
                className={`flex items-center gap-3 hover:bg-main-700 p-2.5 rounded-md cursor-pointer border transition-colors ${
                  isActive
                    ? "bg-main-600 border-main-600"
                    : "border-transparent"
                }`}
                onClick={() => handleSelectConversation?.(chat)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${avatarClass}`}
                >
                  {existData && existData.status === "notok" ? (
                    <Check size={16} />
                  ) : sender?.name ? (
                    sender.name.charAt(0)
                  ) : (
                    "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {sender?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {chat?.updated_time
                      ? new Date(chat.updated_time).toLocaleString("th-TH", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "No date"}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">
                    {chat?.unread_count > 0 && (
                      <span className="bg-danger-500 text-white rounded-full px-2 py-0.5 text-xs">
                        {chat.unread_count}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400">
                    {chat?.message_count ?? 0} ข้อความ
                  </span>
                </div>
              </div>
            );
          })
        )}
        {isFetchingNextConversations && (
          <div className="text-center text-xs text-gray-400 py-2">
            กำลังโหลด...
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatLists;
