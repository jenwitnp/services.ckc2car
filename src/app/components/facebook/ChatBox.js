import React, { useRef, useState } from "react";

import { UserPlus, Send, Image as ImageIcon, Lightbulb } from "lucide-react";

import Messages from "./Messages";

import { useQuery } from "@tanstack/react-query";

import { useModals } from "@/app/contexts/ModalProvider";
import CustomerForm from "../CustomerForm";
import { AiConsulting } from "../ai/AiConsulting";
import Loading from "../ui/Loading";
import ModalBox from "../ui/ModalBox";
import { useConsultAi } from "@/app/hooks/useConsultAi";
import { existCustomer } from "@/app/services/ckc/customer";
import { useFacebook } from "@/app/contexts/FacebookProvider";

export default function ChatBox() {
  const {
    messagesError,
    selectedConversation,
    isMessagesLoading,
    sendImages,
    sendMessage,
  } = useFacebook();

  const [input, setInput] = useState("");
  const [showAiAdvice, setShowAiAdvice] = useState(false);
  const fileInputRef = useRef(null);

  const {
    aiAdvice,
    loading: aiLoading,
    error: aiError,
    requestAiConsultation,
  } = useConsultAi({ conversation: selectedConversation });

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  const handleFileChange = async (e) => {
    const file = e.target?.files;
    if (file) {
      await sendImages(Array.from(file));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const { openModals } = useModals();

  // Get sender info
  const sender = selectedConversation?.senders?.data?.[0];

  // Query to check if customer exists (only if sender exists and has id)
  const { data: existData, isLoading: isExistLoading } = useQuery({
    queryKey: ["exist-customer", sender?.id],
    queryFn: () => {
      if (sender?.id) {
        return existCustomer({ field: "facebook_id", id: sender.id });
      }
    },
    enabled: !!sender?.id,
  });

  // Show button only if not loading and customer does not exist
  const showAddCustomerButton =
    sender && !isExistLoading && existData?.status !== "notok";

  return (
    <div className="w-full flex flex-col border-x h-full md:h-screen border-main-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-main-700">
        <h3 className="text-base md:text-lg font-semibold truncate max-w-[150px] md:max-w-none">
          {selectedConversation
            ? selectedConversation.senders?.data?.[0]?.name || "ไม่ทราบชื่อ"
            : "สนทนา"}
        </h3>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            className="flex flex-row justify-between items-center gap-1 md:gap-2 bg-main-500 p-1 pl-2 pr-2 md:pl-4 md:pr-4 rounded-full text-xs md:text-sm"
            title="คุยกับ AI"
            onClick={() => {
              setShowAiAdvice(true);
              requestAiConsultation();
            }}
          >
            <Lightbulb size={16} /> ปรึกษา AI
          </button>
          {showAddCustomerButton && (
            <button
              onClick={() =>
                openModals({
                  data: sender,
                  onConfirm: (cb) => alert(cb.id),
                  component: <CustomerForm />,
                })
              }
              className="bg-success-500 p-2 rounded-full"
            >
              <UserPlus size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 max-h-3/4 overflow-hidden">
        {isMessagesLoading ? <Loading /> : <Messages />}
        {messagesError && (
          <div className="text-red-400 text-xs mt-2 p-2 bg-red-500/10 rounded">
            โหลดข้อความล้มเหลว
          </div>
        )}
      </div>
      {/* Input message */}
      <div className="p-3 md:p-4 border-t border-main-700 flex items-center gap-2 md:gap-3">
        <input
          type="text"
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 py-2 px-3 rounded bg-[#1F2937] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className="text-lg md:text-xl text-blue-500 p-2 hover:bg-blue-500/10 rounded-full transition-colors"
          onClick={() => fileInputRef.current?.click()}
          title="ส่งรูปภาพ"
          type="button"
        >
          <ImageIcon size={20} />
        </button>
        <button
          className="text-lg md:text-xl text-blue-500 p-2 hover:bg-blue-500/10 rounded-full transition-colors"
          onClick={handleSend}
          type="button"
          disabled={!input.trim()}
        >
          <Send size={20} />
        </button>
      </div>

      {/* AI Advice Modal/Section */}
      <ModalBox
        isOpen={showAiAdvice}
        onClose={() => setShowAiAdvice(false)}
        size="l"
        showFooter={true}
      >
        <AiConsulting conversation={selectedConversation} />
      </ModalBox>
    </div>
  );
}
