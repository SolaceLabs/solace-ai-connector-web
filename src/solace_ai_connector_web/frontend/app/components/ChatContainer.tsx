import { useAuthCheck } from "../hooks/useAuthCheck";
import { useChat } from "../hooks/useChat";
import ChatBox from "./ChatBox/ChatBox";
import DarkModeToggle from "./DarkModeToggle";
import { Message } from "./ChatBox/ChatBox.types";
import { useConfig } from "./ConfigProvider";
import { DragEvent, useState, useRef } from "react";

interface ChatConfig {
  serverUrl: string;
}

export default function ChatContainer() {
  const { configUseAuthorization, configWelcomeMessage, configServerUrl, configBotName } = useConfig();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const dragCounterRef = useRef(0);

  const config: ChatConfig = {
    serverUrl: configServerUrl
  };

  const WELCOME_MESSAGE: Message = {
    text:
      configWelcomeMessage ||
      "👋 Hi! I'm Agent Mesh. How can I help you today?",
    isUser: false,
  };

  const useAuthorization = configUseAuthorization;
  const defaultIsAuthenticated = configUseAuthorization;

  // Auth Checking
  const { isValidatingToken, isAuthenticated, handleLogin } = useAuthCheck({
    serverUrl: config.serverUrl,
    useAuthorization,
    defaultIsAuthenticated,
  });

  // Chat State
  const {
    messages,
    userInput,
    setUserInput,
    isResponding,
    handleNewSession,
    handleSubmit,
    darkMode,
    setDarkMode,
  } = useChat({
    serverUrl: config.serverUrl,
    welcomeMessage: WELCOME_MESSAGE,
  });

  // Drag and drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const droppedFiles = Array.from(e.dataTransfer.files);

    if (droppedFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  // Auth logic
  if (useAuthorization) {
    if (isValidatingToken) {
      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solace-green mx-auto mb-4"></div>
            <h1 className="text-2xl mb-4 text-black dark:text-white">
              Validating your session...
            </h1>
          </div>
        </div>
      );
    }
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl mb-4 text-black dark:text-white">
              Welcome to {configBotName}
            </h1>
            <p className="mb-4 text-black dark:text-white">Please log in to continue</p>
            <button
              onClick={handleLogin}
              className="bg-solace-green text-white px-6 py-2 rounded shadow hover:bg-solace-dark-green"
            >
              Login
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div
      className={`${darkMode ? "dark" : ""} min-h-screen relative`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 w-full h-full bg-gray-900/50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="flex flex-col items-center">
              <div className="text-solace-blue dark:text-solace-green text-4xl mb-4">
                📂
              </div>
              <p className="text-lg font-medium text-solace-blue dark:text-solace-green">
                Add Anything
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Drop any file here to add it to the conversation
              </p>
            </div>
          </div>
        </div>
      )}
      <header className="fixed top-0 left-0 right-0 bg-solace-light-blue text-white p-4 flex justify-between items-center shadow-lg backdrop-blur-sm z-50 transition-all duration-300">
        <div className="flex items-center space-x-3">
      <div className={`h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 shadow-md
                    ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <img
              src="/solace_chat_header_icon.png"
              alt="Agent Mesh Logo"
              className="h-full w-full object-cover"
            />
          </div>
        <h1 className="text-xl font-semibold tracking-tight">{configBotName}</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleNewSession}
            className="bg-white/15 hover:bg-white/25 text-white px-5 py-2 rounded-full
                      transition-all duration-200 text-sm font-medium flex items-center space-x-2
                      border border-white/20 hover:border-white/30 shadow-sm"
          >
            <span>New Session</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <DarkModeToggle
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            className="p-2 hover:bg-white/15 rounded-full transition-all duration-200"
          />
        </div>
      </header>

      <main className="flex-1 pt-20 bg-white dark:bg-gray-900 min-h-screen">
        <div
          className={`pb-16 w-11/12 transition-all duration-300
            ${
              isPreviewOpen
                ? "md:w-[60%] ml-[100px] mr-auto" // SHIFT LEFT & leave space on right
                : "md:w-2/4 mx-auto" // Center if no preview
            }
          `}
        >
          <ChatBox
            messages={messages}
            userInput={userInput}
            setUserInput={setUserInput}
            handleSubmit={(e) => {
              handleSubmit(e, selectedFiles);
              setSelectedFiles([]);
            }}
            isResponding={isResponding}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            // Pass callbacks so ChatBox can tell us when preview is open/closed
            onPreviewOpen={() => setIsPreviewOpen(true)}
            onPreviewClose={() => setIsPreviewOpen(false)}
          />
        </div>
      </main>
    </div>
  );
}