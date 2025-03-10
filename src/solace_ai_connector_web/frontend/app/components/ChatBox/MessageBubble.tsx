import { memo } from "react";
import { Message } from "./ChatBox.types";
import { CustomMarkdown } from "../CustomMarkdown";
import FileDisplay, { FileAttachment, FileRow } from "../FileDisplay";
import LoadingIndicator from "./LoadingIndicator";
import { FeedbackButtons } from './FeedbackButtons';
import { useConfig } from "../ConfigProvider";

interface MessageBubbleProps {
  msg: Message;
  idx: number;
  alreadyRendered: boolean;
  onPreviewFile?: (file: FileAttachment) => void;
  onRunFile?: (file: FileAttachment) => void;
}

function MessageBubble({ 
  msg, 
  idx, 
  alreadyRendered, 
  onPreviewFile,
  onRunFile
}: Readonly<MessageBubbleProps>) {
  const { configCollectFeedback } = useConfig();
  
  // function to render current status
  const renderStatusMessage = () => {
    if (!msg.statusMessage) return null;
    
    // Check for completion or error status to style differently
    const isComplete = msg.statusMessage.message.includes("✅");
    const isError = msg.text.includes("There was an error processing your request. Please try again.");
    const isThinking = msg.statusMessage.message.includes("🤔");
    
    return ( 
      <div className={`
        mb-2 rounded-md overflow-hidden
        ${isComplete 
          ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50' 
          : isError
            ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50'
            : isThinking
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50'
              : 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600/50'}
        border
        text-gray-800 dark:text-gray-200
        shadow-sm
      `}>
        <div className="px-3 py-2 flex items-center space-x-2.5">
          {!isComplete && !isError && (
            <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-solace-blue dark:bg-solace-green animate-pulse"></span>
          )}
          <span className="text-sm">{msg.statusMessage.message}</span>
        </div>
      </div>
    );
  };
  
  const renderMessageContent = (msg: Message) => {
    if (msg.isUser) {
      return <span>{msg.text}</span>;
    }
    if (msg.isStatusMessage) {
      return (
        <span>
          {msg.text.split(' ').map((word, i, arr) => (
            <span key={`${word}-${i}`}>
              {word}
              {i === arr.length - 1 ? <LoadingIndicator /> : ' '}
            </span>
          ))}
        </span>
      );
    }
    return <CustomMarkdown>{msg.text}</CustomMarkdown>;
  };

  return (
    <div className={`my-4 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="relative">
        <div className={`${msg.isUser ? 'mr-3 flex flex-col items-end pb-4' : 'ml-3 flex flex-col items-start pb-4'}`}>
          {/* Status message */}
          {msg.statusMessage && renderStatusMessage()}
          
          {/* Message bubble */}
          {msg.text?.trim() && (
            <>
              <div className={`p-3 rounded-lg whitespace-pre-wrap max-w-[85vw] sm:max-w-[70vw] ${
                msg.isUser
                  ? 'bg-solace-blue text-white dark:bg-solace-green ml-4 '
                  : 'bg-gray-200 dark:bg-gray-600 text-black dark:text-white'
              }`}
              >
                {renderMessageContent(msg)}
              </div>
              {configCollectFeedback && !msg.isUser && !msg.isStatusMessage && (
                msg.metadata ? (
                  <FeedbackButtons
                    messageId={idx}
                    messageText={msg.text}
                    metadata={msg.metadata}
                  />
                ) : (
                  <FeedbackButtons messageId={idx} messageText={msg.text} />
                )
              )}
            </>
          )}

          {/* Bot-returned files with feedback buttons when no text */}
          {msg.files && msg.files.length > 0 && (
            <div className="mt-2 space-y-2 self-stretch">
              {msg.files.map((file, fileIdx) => (
                <FileDisplay 
                  key={`bot-file-${idx}-${fileIdx}`} 
                  file={file} 
                  onPreview={onPreviewFile ? () => onPreviewFile(file) : undefined}
                  onRun={onRunFile ? () => onRunFile(file) : undefined}
                />
              ))}
              {!msg.text?.trim() && configCollectFeedback && !msg.isUser && !msg.isStatusMessage && (
                msg.metadata ? (
                  <FeedbackButtons
                    messageId={idx}
                    messageText={msg.text}
                    metadata={msg.metadata}
                  />
                ) : (
                  <FeedbackButtons messageId={idx} messageText={msg.text} />
                )
              )}
            </div>
          )}
          {/* User-uploaded files */}
          {msg.uploadedFiles && msg.uploadedFiles.length > 0 && (
            <div className="mt-2 space-y-2 self-stretch ml-4">
              {msg.uploadedFiles.map((file, fileIdx) => (
                <FileRow key={`uploaded-file-${idx}-${fileIdx}`} filename={file.name} />
              ))}
            </div>
          )}
        </div>
        {/* Avatar */}
        <span
          className={`absolute -top-6 ${
            msg.isUser ? "right-[-20px]" : "left-[-20px]"
          } w-8 h-8 flex items-center justify-center rounded-full ${
            msg.isUser
              ? "bg-gray-200 text-white dark:bg-gray-600"
              : "bg-transparent dark:bg-transparent text-black dark:text-white"
          }`}
        >
          {msg.isUser ? (
            "👤"
          ) : (
            <img
              src="solace_chat_icon.png"
              alt="Bot Icon"
              style={{ width: 24, height: 24 }}
            />
          )}
        </span>
      </div>
    </div>
  );
};

export default memo(MessageBubble);