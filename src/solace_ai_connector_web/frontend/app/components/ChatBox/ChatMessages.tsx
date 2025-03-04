// Update ChatMessages.tsx
import { useRef, useMemo } from "react";
import { Message } from "./ChatBox.types";
import MessageBubble from "./MessageBubble";
import { FileAttachment } from "../FileDisplay";

interface ChatMessagesProps {
  messages: Message[];
  scrollToBottom: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onPreviewFile?: (file: FileAttachment) => void;
}

export default function ChatMessages({ 
  messages, 
  scrollToBottom,
  messagesEndRef,
  onPreviewFile
}: Readonly<ChatMessagesProps>) {
  // Keep track of which messages have been "fully rendered"
  const renderedMessagesRef = useRef(new Set<number>());

  const messageElements = useMemo(() => {
    return messages.map((msg, idx) => {
      if (!msg) return null;
      const isBotMessage = !msg.isUser && !msg.isStatusMessage;
      const alreadyRendered = renderedMessagesRef.current.has(idx);

      if (isBotMessage && !alreadyRendered) {
        renderedMessagesRef.current.add(idx);
      }

      return (
        <MessageBubble
          key={`${msg.metadata?.sessionId}-${idx}-${msg.isUser ? 'user' : 'bot'}`}
          msg={msg}
          idx={idx}
          alreadyRendered={alreadyRendered}
          onPreviewFile={onPreviewFile}
        />
      );
    });
  }, [messages, onPreviewFile]);

  // Clear the list if messages is empty
  if (messages.length === 0) {
    renderedMessagesRef.current.clear();
  }

  return (
    <div className="space-y-4 py-4">
    {messageElements}
    <div ref={messagesEndRef} className="h-0" />
    </div>
  );
}