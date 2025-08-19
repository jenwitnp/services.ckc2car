import React, { useCallback } from "react";
import { Search, Zap, Brain, Eye } from "lucide-react";
import { messageUtils } from "../utils/messageUtils";
import { urlUtils } from "../utils/urlUtils";
import CarDetailButton from "./CarDetailButton";
import { CONSTANTS } from "../utils/constants";

const TextWithUrlButtons = React.memo(({ text, carData = [] }) => {
  let processedText = text;
  const elements = [];
  let keyIndex = 0;

  // Find car codes in text and replace with buttons
  const carCodePattern = /\b([A-Z]\d+|SOLD)\b/g;
  const carCodeMatches = [...text.matchAll(carCodePattern)];

  carCodeMatches.forEach((match) => {
    const carCode = match[0];
    const matchIndex = match.index;

    // Find corresponding car data
    const foundCar = carData.find(
      (car) =>
        car["รหัสรถ"] === carCode ||
        car.รหัสรถ === carCode ||
        car.key_word?.includes(carCode)
    );

    if (foundCar) {
      // Add text before the car code
      const beforeText = processedText.substring(0, matchIndex);
      if (beforeText) {
        elements.push(
          <span key={`text-${keyIndex++}`} className="whitespace-pre-wrap">
            {beforeText}
          </span>
        );
      }

      // Generate URL using urlUtils
      const generatedUrl = urlUtils.generateCarDetailUrl(foundCar);

      elements.push(
        <CarDetailButton
          key={`car-${keyIndex++}`}
          url={generatedUrl}
          carId={carCode}
          title={`${foundCar.ยี่ห้อ} ${foundCar.รุ่น} ${foundCar.รถปี}`}
          size="sm"
          className="mx-1 my-1"
        />
      );

      // Update processed text to remove the matched part
      processedText = processedText.substring(matchIndex + carCode.length);
    }
  });

  // Add remaining text
  if (processedText) {
    elements.push(
      <span key={`text-final-${keyIndex}`} className="whitespace-pre-wrap">
        {processedText}
      </span>
    );
  }

  // If no car codes found, check for existing URLs as fallback
  if (elements.length === 0) {
    const urlMatches = messageUtils.extractUrlsFromText(text);
    if (urlMatches.length > 0) {
      return <TextWithUrlButtonsOriginal text={text} urlMatches={urlMatches} />;
    }
  }

  return elements.length > 0 ? (
    <div className="leading-relaxed">{elements}</div>
  ) : (
    <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
  );
});

// Keep original function as fallback for existing URLs
const TextWithUrlButtonsOriginal = React.memo(({ text, urlMatches }) => {
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
  const carCodeMatch = part.match(/\b([A-Z]\d+|SOLD)\b/);
  const carCode = carCodeMatch?.[0];
  const carData = carCode
    ? rawData.find(
        (car) =>
          car["รหัสรถ"] === carCode ||
          car.รหัสรถ === carCode ||
          car.key_word?.includes(carCode)
      )
    : null;

  let textToShow = part.trim();

  // Remove any existing URL references from text
  if (carData) {
    textToShow = textToShow.replace(/- \*\*รายละเอียด:\*\*.*\n?/g, "");
    textToShow = textToShow.replace(/รายละเอียด:.*$/gm, "");
  }

  if (!textToShow) return null;

  return (
    <div className="my-3 p-4 bg-main-800 rounded-xl border border-gray-200/60 shadow-sm">
      <div className="whitespace-pre-wrap mb-3">🚗 {textToShow}</div>

      <div className="flex flex-wrap gap-2">
        {carData && (
          <CarDetailButton
            url={urlUtils.generateCarDetailUrl(carData)}
            carId={carData["รหัสรถ"] || carData.รหัสรถ}
            title={`${carData.ยี่ห้อ} ${carData.รุ่น} ${carData.รถปี}`}
            variant="primary"
            size="sm"
          />
        )}

        {/* YouTube link if available */}
        {carData?.youtube && (
          <button
            onClick={() => window.open(carData.youtube, "_blank")}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
          >
            📺 YouTube
          </button>
        )}
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

    renderedParts.push(
      <div key="intro" className="whitespace-pre-wrap mb-3">
        <TextWithUrlButtons text={introText} carData={rawData} />
      </div>
    );
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
        renderedParts.push(
          <div key="summary" className="whitespace-pre-wrap mt-4">
            <TextWithUrlButtons text={summary} carData={rawData} />
          </div>
        );
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
      console.log("renderTextWithLinks - rawData:", rawData);

      // If we have raw data, use it to generate proper URLs
      if (rawData?.length > 0) {
        if (text.includes("🚗")) {
          return <StructuredCarContent text={text} rawData={rawData} />;
        } else {
          return <TextWithUrlButtons text={text} carData={rawData} />;
        }
      }

      // Fallback to URL extraction for backward compatibility
      const urlMatches = messageUtils.extractUrlsFromText(text);
      if (urlMatches.length > 0) {
        return (
          <TextWithUrlButtonsOriginal text={text} urlMatches={urlMatches} />
        );
      }

      return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>;
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
TextWithUrlButtonsOriginal.displayName = "TextWithUrlButtonsOriginal";
StructuredCarContent.displayName = "StructuredCarContent";
CarCard.displayName = "CarCard";

export default MessageRenderer;
