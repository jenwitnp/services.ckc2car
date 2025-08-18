import React, { useCallback } from "react";
import { Search, Zap, Brain, Eye } from "lucide-react";
import { messageUtils } from "../utils/messageUtils";
import { urlUtils } from "../utils/urlUtils";
import CarDetailButton from "./CarDetailButton";
import { CONSTANTS } from "../utils/constants";

const TextWithUrlButtons = React.memo(({ text, urlMatches }) => {
  let processedText = text;
  const elements = [];
  let keyIndex = 0;

  urlMatches.forEach((match) => {
    const fullUrl = match[0];
    const carId = match[1];
    const parts = processedText.split(fullUrl);

    if (parts[0]) {
      elements.push(
        <span key={`text-${keyIndex++}`} className="whitespace-pre-wrap">
          {parts[0]}
        </span>
      );
    }

    elements.push(
      <CarDetailButton
        key={`url-${keyIndex++}`}
        url={fullUrl}
        carId={carId}
        size="sm"
        className="mx-1 my-1"
      />
    );

    processedText = parts.slice(1).join(fullUrl);
  });

  if (processedText) {
    elements.push(
      <span key={`text-final-${keyIndex}`} className="whitespace-pre-wrap">
        {processedText}
      </span>
    );
  }

  return <div className="leading-relaxed">{elements}</div>;
});

const CarCard = React.memo(({ part, rawData }) => {
  const carCodeMatch = part.match(/\b[A-Z]\d+\b/);
  const carCode = carCodeMatch?.[0];
  const carData = carCode
    ? rawData.find((car) => car["รหัสรถ"] === carCode)
    : null;

  const urlMatches = messageUtils.extractUrlsFromText(part);

  const hasRawDataUrl = carData?.url;
  const hasTextUrl = urlMatches.length > 0;

  let textToShow = part.trim();
  if (hasRawDataUrl) {
    textToShow = textToShow.replace(/- \*\*รายละเอียด:\*\*.*\n?/g, "");
  }

  if (!textToShow) return null;

  return (
    <div className="my-3 p-4 bg-white/60 rounded-xl border border-gray-200/60 shadow-sm">
      <div className="whitespace-pre-wrap mb-3">🚗 {textToShow}</div>

      <div className="flex flex-wrap gap-2">
        {hasRawDataUrl ? (
          <CarDetailButton
            url={carData.url}
            carId={carData["รหัสรถ"]}
            variant="primary"
            size="sm"
          />
        ) : hasTextUrl ? (
          <CarDetailButton
            url={urlMatches[0][0]}
            carId={urlMatches[0][1]}
            variant="secondary"
            size="sm"
          />
        ) : null}

        {/* Additional URLs (only if no rawData) */}
        {!hasRawDataUrl &&
          urlMatches.length > 1 &&
          urlMatches
            .slice(1)
            .map((match, index) => (
              <CarDetailButton
                key={index}
                url={match[0]}
                carId={match[1]}
                variant="outline"
                size="xs"
              />
            ))}
      </div>
    </div>
  );
});

const StructuredCarContent = React.memo(({ text, rawData }) => {
  const textParts = text.split("🚗");
  const renderedParts = [];

  // Intro text
  if (textParts[0]) {
    const introText = textParts[0].trim();
    const introUrls = messageUtils.extractUrlsFromText(introText);

    if (introUrls.length > 0) {
      renderedParts.push(
        <div key="intro" className="whitespace-pre-wrap mb-3">
          <TextWithUrlButtons text={introText} urlMatches={introUrls} />
        </div>
      );
    } else {
      renderedParts.push(
        <p key="intro" className="whitespace-pre-wrap mb-3">
          {introText}
        </p>
      );
    }
  }

  // Car cards
  const carParts = textParts.slice(1);
  carParts.forEach((part, index) => {
    const isLast = index === carParts.length - 1;

    if (isLast && carParts.length > 1) {
      const segments = part.split(/\n\s*\n/);
      const carDetails = segments[0];
      const summary = segments.slice(1).join("\n\n").trim();

      if (carDetails.trim()) {
        renderedParts.push(
          <CarCard key={`car-${index}`} part={carDetails} rawData={rawData} />
        );
      }

      if (summary) {
        const summaryUrls = messageUtils.extractUrlsFromText(summary);
        if (summaryUrls.length > 0) {
          renderedParts.push(
            <div key="summary" className="whitespace-pre-wrap mt-4">
              <TextWithUrlButtons text={summary} urlMatches={summaryUrls} />
            </div>
          );
        } else {
          renderedParts.push(
            <p key="summary" className="whitespace-pre-wrap mt-4">
              {summary}
            </p>
          );
        }
      }
    } else {
      renderedParts.push(
        <CarCard key={`car-${index}`} part={part} rawData={rawData} />
      );
    }
  });

  return renderedParts;
});

const MessageRenderer = React.memo(
  ({ message, onViewAllResults, isDesktop }) => {
    const messageType = messageUtils.getMessageType(message);
    const isUser = message.role === "user";
    const shouldShowButton = messageUtils.shouldShowViewAllButton(message);

    const renderTextWithLinks = useCallback((text, rawData = []) => {
      const urlMatches = messageUtils.extractUrlsFromText(text);

      if (!rawData?.length || !text.includes("🚗")) {
        if (urlMatches.length > 0) {
          return <TextWithUrlButtons text={text} urlMatches={urlMatches} />;
        }
        return (
          <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
        );
      }

      return <StructuredCarContent text={text} rawData={rawData} />;
    }, []);

    const handleViewAllClick = useCallback(() => {
      const message_context = message;
      if (message_context?.query && typeof message_context.query === "object") {
        urlUtils.openSearchResults(message_context.query);
      } else {
        urlUtils.openFallbackSearch();
      }
    }, [message]);

    // ✅ Updated message styles using Tailwind classes
    const messageStyles = React.useMemo(() => {
      if (isUser) {
        return (
          CONSTANTS.CSS_CLASSES.CHAT_MESSAGE_USER +
          " rounded-l-2xl rounded-tr-2xl"
        );
      }

      const typeStyleMap = {
        error: CONSTANTS.CSS_CLASSES.CHAT_MESSAGE_ERROR,
        function: CONSTANTS.CSS_CLASSES.CHAT_MESSAGE_FUNCTION,
        query: CONSTANTS.CSS_CLASSES.CHAT_MESSAGE_QUERY,
        assistant: CONSTANTS.CSS_CLASSES.CHAT_MESSAGE_ASSISTANT,
      };

      return `rounded-r-2xl rounded-tl-2xl shadow-sm border ${typeStyleMap[messageType]}`;
    }, [isUser, messageType]);

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`max-w-[85%] ${
            isDesktop ? "max-w-[75%]" : ""
          } ${messageStyles} px-4 py-3 relative group`}
        >
          {/* Message content */}
          <div className="text-sm leading-relaxed">
            {renderTextWithLinks(message.text, message.rawData)}
          </div>

          {/* Metadata */}
          {!isUser && (
            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
              <div className="flex items-center space-x-2">
                {messageType === "function" && (
                  <span className="flex items-center text-success-600">
                    <Zap size={12} className="mr-1" />
                    Function Call
                  </span>
                )}
                {messageType === "query" && message.count > 0 && (
                  <span className="flex items-center text-primary-600">
                    <Search size={12} className="mr-1" />
                    {message.count} results
                  </span>
                )}
                {message.cached && (
                  <span className="flex items-center text-info-600">
                    <Brain size={12} className="mr-1" />
                    Cached
                  </span>
                )}
              </div>
              <div className="text-xs">
                {new Date(message.timestamp).toLocaleTimeString("th-TH")}
              </div>
            </div>
          )}

          {/* View All Results Button */}
          {shouldShowButton && (
            <div className="mt-3 pt-3 border-t border-main-200">
              <button
                onClick={handleViewAllClick}
                className={`w-full py-2 ${CONSTANTS.CSS_CLASSES.BG_PRIMARY} ${CONSTANTS.CSS_CLASSES.BG_PRIMARY_HOVER} text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm`}
              >
                <Eye size={16} className="mr-2" />
                <span>ดูผลลัพธ์ทั้งหมด ({message.count} รายการ)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageRenderer.displayName = "MessageRenderer";
TextWithUrlButtons.displayName = "TextWithUrlButtons";
StructuredCarContent.displayName = "StructuredCarContent";
CarCard.displayName = "CarCard";

export default MessageRenderer;
