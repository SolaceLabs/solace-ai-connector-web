export interface FileAttachment {
    name: string;
    content: string;
  }
  export interface StatusMessage {
    id: string;
    message: string;
  }

  export interface Message {
    text: string;
    isUser: boolean;
    isStatusMessage?: boolean;
    isThinkingMessage?: boolean;
    files?: FileAttachment[];
    statusMessage?: StatusMessage| null;
    uploadedFiles?: File[];
    metadata?: {
      messageId?: string;
      sessionId: string;
    };
  }