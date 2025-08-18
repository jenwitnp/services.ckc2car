import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import { useFacebook } from "@/app/contexts/FacebookProvider";

// Facebook image loader
const fbImageLoader = ({ src }) => src;

// Regex for URLs
const urlRegex = /(https?:\/\/[^\s]+)/g;

const Messages = () => {
  const {
    messagesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    selectedPage,
  } = useFacebook();

  // Flatten all messages from all pages and sort by created_time ascending
  const messages =
    messagesPages?.pages
      ?.flatMap((page) => page.data)
      .sort(
        (a, b) =>
          new Date(a.created_time).getTime() -
          new Date(b.created_time).getTime()
      ) || [];

  const scrollContainerRef = useRef(null);

  const [hasScrolled, setHasScrolled] = useState(false);
  const prevHeightRef = useRef(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Scroll to bottom only the first time the component is mounted
  useEffect(() => {
    if (!hasScrolled && messages.length > 0) {
      scrollToBottom();
      setHasScrolled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Keep scroll position when loading previous messages
  useEffect(() => {
    if (
      !isFetchingNextPage &&
      prevHeightRef.current &&
      scrollContainerRef.current
    ) {
      const newHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop = newHeight - prevHeightRef.current;
      prevHeightRef.current = 0;
    }
  }, [isFetchingNextPage, messages.length]);

  // Infinite scroll: fetch previous messages when scrolled to top
  // Also show/hide scroll-to-bottom button based on scroll position
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      // Load more when scrolled to top
      if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        prevHeightRef.current = scrollHeight;
        fetchNextPage();
      }

      // Show scroll-to-bottom button when not at bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col relative">
      {/* chat */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3 md:space-y-4 p-3 md:p-4 scroll-smooth"
        onScroll={handleScroll}
      >
        {isFetchingNextPage && (
          <div className="text-center text-xs text-gray-400 py-2">
            กำลังโหลด...
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.from.id === selectedPage?.id;
          const parts = msg.message ? msg.message.split(urlRegex) : [];
          return (
            <div
              key={msg.id}
              className={`flex ${
                isMe ? "justify-end" : "justify-start"
              } animate-fadeIn`}
            >
              <div
                className={`max-w-[80%] md:max-w-xs p-2.5 md:p-3 text-sm rounded-lg ${
                  isMe ? "bg-primary-600" : "bg-main-700"
                }`}
              >
                {msg.message && (
                  <p>
                    {parts.map((part, idx) =>
                      urlRegex.test(part) ? (
                        <a
                          key={idx}
                          href={part}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 underline"
                        >
                          ดูความคิดเห็น
                        </a>
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    )}
                  </p>
                )}
                {msg.attachments?.data?.map((att) =>
                  att.image_data?.url ? (
                    <div key={att.id} className="my-2">
                      <Image
                        loader={fbImageLoader}
                        src={att.image_data.url}
                        alt="attachment"
                        width={200}
                        height={200}
                        className="rounded"
                      />
                    </div>
                  ) : null
                )}
                <span className="block text-right text-xs text-gray-300 mt-1">
                  {new Date(msg.created_time).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {/* end chat */}

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-primary-600 text-white rounded-full p-2 shadow-lg hover:bg-primary-700 transition-opacity opacity-80 hover:opacity-100"
          aria-label="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Messages;
