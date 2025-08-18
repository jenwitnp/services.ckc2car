"use client";
import React, { createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";
import {
  fetchPages,
  fetchConversations,
  fetchMessagesInfinite,
  sendImagesToFacebook,
  sendMessageToFacebook,
} from "@/app/services/query/facebookQuery";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useModals } from "./ModalProvider";

// Remove all TypeScript types

const FacebookContext = createContext(undefined);

export function FacebookProvider({ children }) {
  const { data: session } = useSession();
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { openModals } = useModals();

  // Helper function to show error in modal
  const showErrorModal = (error, title = "เกิดข้อผิดพลาด") => {
    const errorMessage =
      error?.message ||
      "ไม่สามารถเชื่อมต่อกับ Facebook ได้ กรุณาลองใหม่อีกครั้ง";
    openModals({
      title,
      description: errorMessage,
      onConfirm: () => {},
    });
  };

  // Pages
  const {
    data: pages,
    isLoading: isPagesLoading,
    error: pagesError,
    refetch: refetchPages,
  } = useQuery({
    queryKey: ["pages", session?.accessToken],
    enabled: !!session?.accessToken && session?.provider === "facebook",
    queryFn: async () => {
      if (!session?.accessToken)
        throw new Error("ไม่มี Access Token โปรดเข้าสู่ระบบ Facebook อีกครั้ง");
      try {
        return await fetchPages(session.accessToken);
      } catch (error) {
        showErrorModal(error, "ไม่สามารถโหลดเพจได้");
        throw error;
      }
    },
    onError: (error) => {
      showErrorModal(error);
    },
    onError: (error) => {
      showErrorModal(error);
    },
  });

  // Conversations
  const {
    data: conversationsPages,
    isLoading: isConversationsLoading,
    error: conversationsError,
    fetchNextPage: fetchNextConversations,
    hasNextPage: hasNextConversations,
    isFetchingNextPage: isFetchingNextConversations,
    refetch: refetchConversations,
  } = useInfiniteQuery({
    queryKey: ["conversations", selectedPage?.id, selectedPage?.access_token],
    enabled: !!selectedPage,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      try {
        return await fetchConversations(
          selectedPage.id,
          selectedPage.access_token,
          pageParam
        );
      } catch (error) {
        showErrorModal(error, "ไม่สามารถโหลดการสนทนาได้");
        throw error;
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.paging?.next ? lastPage.paging.next : undefined,
    onError: (error) => {
      showErrorModal(error);
    },
  });

  const {
    data: messagesPages,
    isLoading: isMessagesLoading,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useInfiniteQuery({
    queryKey: [
      "messages",
      selectedConversation?.id,
      selectedPage?.access_token,
    ],
    enabled: !!selectedConversation && !!selectedPage,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      try {
        return await fetchMessagesInfinite({
          pageParam,
          conversationId: selectedConversation.id,
          accessToken: selectedPage.access_token,
        });
      } catch (error) {
        showErrorModal(error, "ไม่สามารถโหลดข้อความได้");
        throw error;
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.paging?.next ? lastPage.paging.next : undefined,
    onError: (error) => {
      showErrorModal(error);
    },
  });

  const sendImages = async (files) => {
    if (!selectedConversation?.id || !selectedPage?.access_token) {
      showErrorModal({
        message: "ไม่สามารถส่งรูปภาพได้ กรุณาเลือกการสนทนาก่อน",
      });
      return;
    }

    try {
      await sendImagesToFacebook({
        conversationId: selectedConversation.id,
        files,
        accessToken: selectedPage.access_token,
      });
      refetchMessages();
    } catch (error) {
      showErrorModal(error, "ไม่สามารถส่งรูปภาพได้");
    }
  };

  const sendMessage = async (message) => {
    if (!selectedConversation?.id || !selectedPage?.access_token) {
      showErrorModal({
        message: "ไม่สามารถส่งข้อความได้ กรุณาเลือกการสนทนาก่อน",
      });
      return;
    }

    try {
      await sendMessageToFacebook({
        conversationId: selectedConversation.id,
        message,
        accessToken: selectedPage.access_token,
      });
      refetchMessages();
    } catch (error) {
      showErrorModal(error, "ไม่สามารถส่งข้อความได้");
    }
  };

  // Handlers
  const handleSelectPage = (page) => {
    try {
      if (!page) {
        showErrorModal({
          message: "ไม่สามารถเลือกเพจได้ เนื่องจากไม่พบข้อมูลเพจ",
        });
        return;
      }

      setSelectedPage(page);
      setSelectedConversation(null);
      refetchConversations();
    } catch (error) {
      showErrorModal(error, "เกิดข้อผิดพลาดในการเลือกเพจ");
    }
  };

  const handleSelectConversation = (conv) => {
    try {
      if (
        conv &&
        typeof conv.message_count === "number" &&
        conv.senders &&
        typeof conv.unread_count === "number" &&
        typeof conv.updated_time === "string" &&
        typeof conv.id === "string"
      ) {
        setSelectedConversation({
          ...conv,
          page_access_token: selectedPage?.access_token,
          page_id: selectedPage?.id,
        });
        refetchMessages();
      } else {
        if (conv) {
          // If we have a conversation object but it's missing required fields
          showErrorModal(
            {
              message: "ข้อมูลการสนทนาไม่ครบถ้วน กรุณาลองใหม่อีกครั้ง",
            },
            "ไม่สามารถเลือกการสนทนาได้"
          );
        }
        setSelectedConversation(null);
      }
    } catch (error) {
      showErrorModal(error, "เกิดข้อผิดพลาดในการเลือกการสนทนา");
      setSelectedConversation(null);
    }
  };

  return (
    <FacebookContext.Provider
      value={{
        pages,
        isPagesLoading,
        pagesError,
        selectedPage,
        setSelectedPage,
        conversationsPages,
        fetchNextConversations,
        hasNextConversations,
        isFetchingNextConversations,
        isConversationsLoading,
        conversationsError,
        selectedConversation,
        setSelectedConversation,
        messagesPages,
        isMessagesLoading,
        messagesError,
        refetchPages,
        refetchConversations,
        refetchMessages,
        handleSelectPage,
        handleSelectConversation,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        sendImages,
        sendMessage,
      }}
    >
      {children}
    </FacebookContext.Provider>
  );
}

export function useFacebook() {
  const ctx = useContext(FacebookContext);
  if (!ctx) throw new Error("useFacebook must be used within FacebookProvider");
  return ctx;
}
