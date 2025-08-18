"use client";

import { AiChatMessageProvider } from "@/app/contexts/AiChatMessage";

export default function AiChatLayout({ children }) {
  return <AiChatMessageProvider>{children}</AiChatMessageProvider>;
}
