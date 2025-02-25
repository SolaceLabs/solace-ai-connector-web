import { useState, useCallback, useEffect } from "react";
import { Message } from "../components/ChatBox/ChatBox.types";
import { getCookie, getCsrfToken, useConfig } from '../components/ConfigProvider';

interface UseChatProps {
  serverUrl: string;
  welcomeMessage: Message;
}

interface StreamState {
  botMessageBuffer: string;
  partialLineBuffer: string;
  hasShownFirstStatus: boolean;
}

interface UseChatReturn {
  sessionId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  isResponding: boolean;
  handleNewSession: () => void;
  handleSubmit: (event: React.FormEvent, files?: File[] | null) => Promise<void>;
  notifications: Array<{ id: string; message: string }>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useChat({ serverUrl, welcomeMessage }: UseChatProps): UseChatReturn {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [userInput, setUserInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string }>
  >([]);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedDarkMode = localStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        return JSON.parse(storedDarkMode);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [currentController, setCurrentController] = useState<AbortController | null>(null);
  const { configBotName } = useConfig();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Helper for notifications
  const addNotification = useCallback((message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const handleNewSession = () => {
    if (currentController) {
      currentController.abort();
      setCurrentController(null);
    }

    setSessionId("");
    setMessages([welcomeMessage]);
    setIsResponding(false);
  };

  const handleSubmit = async (
    event: React.FormEvent,
    files?: File[] | null
  ) => {
    event.preventDefault();
    if (!userInput.trim() && (!files || files.length === 0) || isResponding) return;
  
    abortPreviousRequest(currentController);
    const controller = new AbortController();
    setCurrentController(controller);
    setIsResponding(true);
  
    const { accessToken, refreshToken } = getTokens();
  
    const formData = buildFormData(userInput, sessionId, files);
    addUserMessage(userInput, files);
    addThinkingMessage();
  
    const streamState: StreamState = {
      botMessageBuffer: "",
      partialLineBuffer: "",
      hasShownFirstStatus: false,
    };
    setUserInput("");
  
    try {
      const csrfToken = (await getValidCsrfToken()) ?? "";
      const response = await fetchChat(
        formData,
        controller,
        accessToken,
        refreshToken,
        csrfToken
      );

      if (!response.ok) {
        if (handleInvalidResponse(response)) return;
        throw new Error("Network response was not ok");
      }
  
      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
  
      // Process the streamed response in a helper function.
      const finished = await processStream(reader, decoder, streamState);
      if (finished) return;

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isStatusMessage),
        {
          text: "There was an error processing your request. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      cleanupRequest();
    }
  };

  // Aborts the previous request if an AbortController is provided
  function abortPreviousRequest(controller: AbortController | null) {
    if (controller) {
      controller.abort();
    }
  }
  
  // Processes the stream by reading chunks, decoding them, and handling each line.
  async function processStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder,
    state: StreamState
  ): Promise<boolean> {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      const chunk = decoder.decode(value, { stream: true });
      const combined = state.partialLineBuffer + chunk;
      const lines = combined.split("\n");
      state.partialLineBuffer = lines.pop() || "";
  
      if (await processStreamLines(lines, state)) {
        return true;
      }
    }
    return false;
  }

  // Processes each line from the stream, handling JSON data messages.
  async function processStreamLines(
    lines: string[],
    state: StreamState
  ): Promise<boolean> {
    for (const line of lines) {
      if (!line.trim()) continue;
  
      if (line === "data: [DONE]") {
        processFinalPartial(state.partialLineBuffer);
        return true;
      }
  
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6);
        try {
          const parsedData = JSON.parse(jsonStr);
          const result = processParsedData(
            parsedData,
            state.botMessageBuffer,
            state.hasShownFirstStatus
          );
          state.botMessageBuffer = result.botMessageBuffer;
          state.hasShownFirstStatus = result.hasShownFirstStatus;
        } catch (err) {
          state.partialLineBuffer = line;
        }
      }
    }
    return false;
  }

  // Processes the final partial stream data and updates the UI with any file attachments.
  function processFinalPartial(partialLineBuffer: string) {
    if (partialLineBuffer) {
      try {
        const leftover = partialLineBuffer.replace(/^data:\s*/, "");
        const parsedData = JSON.parse(leftover);
        if (parsedData.files) {
          updateLastMessageWithFiles(parsedData.files);
        }
      } catch (err) {
        console.error("Error parsing final partial data:", err);
      }
    }
    setIsResponding(false);
  }

  // Processes parsed JSON data from the stream, updating tokens, status, content, and files
  function processParsedData(
    parsedData: any,
    botBuffer: string,
    shownFirst: boolean
  ): { botMessageBuffer: string; hasShownFirstStatus: boolean } {
    botBuffer = updateTokensAndSession(parsedData, botBuffer);
    shownFirst = updateStatusMessage(parsedData, botBuffer, shownFirst);
    botBuffer = updateContent(parsedData, botBuffer);
    updateFiles(parsedData);
    return { botMessageBuffer: botBuffer, hasShownFirstStatus: shownFirst };
  }
  
  // Updates tokens and session data from the parsed stream data and returns the current bot message buffer.
  function updateTokensAndSession(parsedData: any, botBuffer: string): string {
    if (parsedData.new_access_token) {
      localStorage.setItem("access_token", parsedData.new_access_token);
    }
    if (parsedData.session_id && !sessionId) {
      setSessionId(parsedData.session_id);
    }
    return botBuffer;
  }
  
  // Updates the status message based on the parsed data and current bot message buffer, managing first-time display.
  function updateStatusMessage(
    parsedData: any,
    botBuffer: string,
    shownFirst: boolean
  ): boolean {
    if (parsedData.status_message) {
      if (botBuffer !== "") {
        addNotification(parsedData.status_message);
      } else if (!shownFirst) {
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.isThinkingMessage),
          {
            text: parsedData.status_message,
            isUser: false,
            isStatusMessage: true,
          },
        ]);
        return true;
      } else {
        addNotification(parsedData.status_message);
      }
    }
    return shownFirst;
  }

  // Appends new content from the parsed data to the bot's message buffer and updates the displayed message.
  function updateContent(parsedData: any, botBuffer: string): string {
    if (parsedData.content) {
      botBuffer += parsedData.content;
      updateBotMessageWithText(botBuffer, parsedData.id, parsedData);
    }
    return botBuffer;
  }

  // Checks for file attachments in the parsed data and updates the last message with these files.
  function updateFiles(parsedData: any) {
    if (parsedData.files) {
      updateLastMessageWithFiles(parsedData.files);
    }
  }

  // Retrieves access and refresh tokens from local storage.
  function getTokens() {
    return {
      accessToken: localStorage.getItem("access_token"),
      refreshToken: localStorage.getItem("refresh_token"),
    };
  }

  // Retrieves a valid CSRF token from cookies or fetches a new one if missing.
  async function getValidCsrfToken() {
    let csrfToken = getCookie("csrf_token");
    if (!csrfToken) {
      csrfToken = await getCsrfToken();
    }
    return csrfToken;
  }

  // Sends a request for chat response to the server with the provided form data and authentication tokens.
  async function fetchChat(
    formData: FormData,
    controller: AbortController,
    accessToken: string | null,
    refreshToken: string | null,
    csrfToken: string
  ) {
    return await fetch(`${serverUrl}/api/v1/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Refresh-Token": refreshToken ?? "",
        "X-CSRF-TOKEN": csrfToken ?? "",
      },
      signal: controller.signal,
      body: formData,
    });
  }
  
  // Handles invalid responses by clearing tokens and redirecting when authentication fails.
  function handleInvalidResponse(response: Response) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/";
      return true;
    }
    return false;
  }

  // Cleans up after a chat request is complete.
  function cleanupRequest() {
    setCurrentController(null);
    setIsResponding(false);
  }

  // Constructs a FormData object with the user's input, session ID, and any attached files.
  function buildFormData(
    userInput: string,
    sessionId?: string,
    files?: File[] | null
  ): FormData {
    const formData = new FormData();
    formData.append("prompt", userInput);
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    if (files) {
      files.forEach((file) => formData.append("files", file));
    }
    return formData;
  }

  // Adds a new user message to the chat with optional file attachments
  function addUserMessage(userInput: string, files?: File[] | null) {
    setMessages((prev) => [
      ...prev,
      {
        text: userInput,
        isUser: true,
        uploadedFiles:
          files && files.length > 0 ? Array.from(files) : undefined,
      },
    ]);
  }

  // Adds a status message indicating that the bot is processing or thinking.
  function addThinkingMessage() {
    setMessages((prev) => [
      ...prev,
      {
        text: `${configBotName} is thinking`,
        isUser: false,
        isStatusMessage: true,
        isThinkingMessage: true,
      },
    ]);
  }

  // Updates the last bot message by attaching files if available.
  function updateLastMessageWithFiles(filesData: any) {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && !lastMessage.isUser) {
        const existingFiles = lastMessage.files || [];
        const newFiles = Array.isArray(filesData) ? filesData : [filesData];
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, files: [...existingFiles, ...newFiles] },
        ];
      }
      return prev;
    });
  }
  
  // Updates the bot's message text with new content and metadata.
  function updateBotMessageWithText(
    botBuffer: string,
    currentMessageId: string,
    parsedData: any
  ) {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      const updatedFields = {
        text: botBuffer,
        isUser: false,
        metadata: {
          sessionId: parsedData.session_id || sessionId,
          messageId: currentMessageId,
        },
      };
      if (lastMessage && !lastMessage.isUser) {
        // Merge the old message + new fields, remove "thinking" and "status"
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            ...updatedFields,
            isStatusMessage: false,
            isThinkingMessage: false,
          },
        ];
      } else {
        return [...prev, updatedFields];
      }
    });
  }
  
  return {
    sessionId,
    messages,
    setMessages,
    userInput,
    setUserInput,
    isResponding,
    handleNewSession,
    handleSubmit,
    notifications,
    darkMode,
    setDarkMode,
  };
}
