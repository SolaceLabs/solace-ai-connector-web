import { useEffect, useRef, useState, useCallback } from "react";
import { FiArrowDown } from "react-icons/fi";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { Message } from "./ChatBox.types";

interface ChatBoxProps {
  messages: Message[];
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent, files?: File[] | null) => void;
  isResponding: boolean;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function ChatBox({
  messages,
  userInput,
  setUserInput,
  handleSubmit,
  isResponding,
  selectedFiles,
  setSelectedFiles,
}: Readonly<ChatBoxProps>) {
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const isAutoScrolling = useRef(false);
  const lastScrollY = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const SCROLL_THRESHOLD = 100;

  // Helper to check if user is near the bottom of the page.
  const isNearBottom = useCallback(() => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const pageHeight = document.body.offsetHeight;
    return pageHeight - (scrollY + viewportHeight) < SCROLL_THRESHOLD;
  }, []);

  /**
   * Our main scroll handler:
   * - If we're auto-scrolling, ignore userHasScrolled toggling.
   * - Otherwise, detect if user scrolled up or down.
   *    - If scrolling up and not near bottom => arrow on (userHasScrolled = true).
   *    - If scrolling down and near bottom => arrow off (userHasScrolled = false).
   */
  const handleWindowScroll = useCallback(() => {
    if (isAutoScrolling.current) {
      return;
    }

    const currentScrollY = window.scrollY;
    const scrolledUp = currentScrollY < lastScrollY.current;

    if (scrolledUp && !isNearBottom()) {
      // User scrolled up away from the bottom => show arrow
      setUserHasScrolled(true);
    } else if (!scrolledUp && isNearBottom()) {
      // User scrolled down to near the bottom => hide arrow
      setUserHasScrolled(false);
    }

    lastScrollY.current = currentScrollY;
  }, [isNearBottom]);

  useEffect(() => {
    lastScrollY.current = window.scrollY; // Initialize
    window.addEventListener("scroll", handleWindowScroll);
    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, [handleWindowScroll]);

  useEffect(() => {
    if (messages.length === 1) {
      setUserHasScrolled(false);
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    isAutoScrolling.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
      isAutoScrolling.current = false;
      if (isNearBottom()) {
        setUserHasScrolled(false);
      }
    }, 300);
  }, [isNearBottom]);


  useEffect(() => {
    if (!userHasScrolled) {
      scrollToBottom();
    }
  }, [messages, userHasScrolled, scrollToBottom]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages container */}
      <div className="flex-1">
        <ChatMessages
          messages={messages}
          scrollToBottom={scrollToBottom}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Floating arrow to return to bottom */}
      {userHasScrolled && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="
            fixed z-50 bottom-20 left-1/2 -translate-x-1/2 
            p-2 rounded-full bg-slate-300 dark:bg-gray-700
            text-black dark:text-gray-200
            shadow hover:bg-gray-300 dark:hover:bg-gray-600
            transition-colors
          "
        >
          <FiArrowDown className="w-4 h-4" strokeWidth={3} />
        </button>
      )}
      {/* Input area */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-10 
          bg-white/95 dark:bg-gray-900/95 
          backdrop-blur-sm
        "
      >
        <div className="md:w-2/4 w-11/12 mx-auto py-2">
          <ChatInput
            userInput={userInput}
            setUserInput={setUserInput}
            handleSubmit={handleSubmit}
            isResponding={isResponding}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
          />
        </div>
      </div>
    </div>
  );
}
