export interface FileAttachment {
    name: string;
    content: string;
  }
  
  export interface Message {
    text: string;
    isUser: boolean;
    isStatusMessage?: boolean;
    isThinkingMessage?: boolean;
    files?: FileAttachment[];
    uploadedFiles?: File[];
    metadata?: {
      messageId?: string;
      sessionId: string;
    };
  }
  