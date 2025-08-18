"use client";

import Loading from "../ui/Loading";
import FailMessage from "../ui/FailMessage";
import PageLists from "./PageLists";
import ChatLists from "./ChatLists";
import ChatBox from "./ChatBox";
import { useFacebook } from "@/app/contexts/FacebookProvider";

export default function FbMessenger() {
  const {
    pages,
    isPagesLoading,
    selectedPage,
    setSelectedPage,
    isConversationsLoading,
    selectedConversation,
    setSelectedConversation,
    pagesError,
    conversationsError,
  } = useFacebook();

  // For mobile layout, we'll use a conditional display approach
  // On mobile, we'll show only one panel at a time based on selection state
  // On desktop, we'll use a traditional three-column layout

  const renderActiveMobilePanel = () => {
    // If no page is selected, show pages list
    if (!selectedPage) {
      return (
        <div className="w-full h-full">
          <h2 className="text-lg font-bold mb-4">Facebook Pages</h2>
          {isPagesLoading && <Loading />}
          {!isPagesLoading && <PageLists pages={pages || []} />}
          {pagesError && (
            <FailMessage
              message={pagesError.message || "Failed to load pages."}
            />
          )}
        </div>
      );
    }

    // If page selected but no conversation, show conversations
    if (selectedPage && !selectedConversation) {
      return (
        <div className="w-full h-full">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setSelectedPage(null)}
              className="mr-2 text-blue-400 hover:text-blue-300"
            >
              ←
            </button>
            รายชื่อเพจ
          </div>
          {isConversationsLoading && <Loading />}
          {!isConversationsLoading && <ChatLists />}
          {conversationsError && (
            <FailMessage
              message={
                conversationsError.message || "Failed to load conversations."
              }
            />
          )}
        </div>
      );
    }

    // If conversation selected, show chat box
    if (selectedConversation) {
      return (
        <div className="w-full h-full">
          <div className="mb-2">
            <button
              onClick={() => setSelectedConversation(null)}
              className="mr-2 text-blue-400 hover:text-blue-300"
            >
              ← อินบ็อก
            </button>
          </div>
          <ChatBox />
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-7rem)] md:h-[calc(100vh-10rem)] w-screen bg-main-900  overflow-hidden">
      {/* Mobile view - Show only one panel at a time */}
      <div className="md:hidden w-full h-full p-4 bg-main-800">
        {renderActiveMobilePanel()}
      </div>

      {/* Desktop view - Show all three panels */}
      <>
        {/* Sidebar - Pages */}
        <aside
          className="hidden md:block w-2/6 min-w-[320px] bg-primary-900 p-4 "
          aria-label="Facebook Pages Sidebar"
        >
          <h2 className="text-lg font-bold mb-4">Facebook Pages</h2>
          {isPagesLoading && <Loading />}
          {!isPagesLoading && <PageLists pages={pages || []} />}
          {pagesError && (
            <FailMessage
              message={pagesError.message || "Failed to load pages."}
            />
          )}
        </aside>

        {/* ChatLists */}
        {selectedPage && (
          <section
            className="hidden md:block w-2/6 bg-main-800 p-4 overflow-y-auto"
            aria-label="Chat List"
          >
            {isConversationsLoading && <Loading />}
            {!isConversationsLoading && <ChatLists />}
            {conversationsError && (
              <FailMessage
                message={
                  conversationsError.message || "Failed to load conversations."
                }
              />
            )}
          </section>
        )}

        {/* ChatBox */}
        {selectedConversation && (
          <main
            className="hidden md:block w-2/6 flex-1 bg-main-900 p-4 overflow-hidden"
            aria-label="Chat Box"
          >
            <ChatBox />
          </main>
        )}
      </>
    </div>
  );
}
