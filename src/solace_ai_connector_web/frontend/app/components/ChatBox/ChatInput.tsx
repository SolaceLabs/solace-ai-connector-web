import { useRef, useState, FormEvent, ChangeEvent } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import FilePreview from "../FilePreview";

interface ChatInputProps {
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: FormEvent, files?: File[] | null) => void;
  isResponding: boolean;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export function ChatInput({
  userInput,
  setUserInput,
  handleSubmit,
  isResponding,
  selectedFiles,
  setSelectedFiles,
}: Readonly<ChatInputProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Check if any of the new files are already selected
      const newFiles = Array.from(files).filter(newFile => 
        !selectedFiles.some(existingFile => 
          existingFile.name === newFile.name && 
          existingFile.size === newFile.size
        )
      );
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (e: FormEvent) => {
    handleSubmit(e, selectedFiles);
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
    setIsMultiLine(false);
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";

    // Choose a maximum height based on screen width:
    // - For very small screens (< 640px): use a lower max height
    // - For medium screens (< 768px): a moderate max height
    // - Otherwise, allow a taller textarea.
    let maxHeight: number;
    if (window.innerWidth < 640) {
      maxHeight = 80;
    } else if (window.innerWidth < 768) {
      maxHeight = 150;
    } else {
      maxHeight = 200;
    }

    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    setIsMultiLine(textarea.scrollHeight > 30);

    setUserInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="px-4 sm:px-6 flex flex-wrap gap-2">
        {selectedFiles.map((file, index) => (
          <FilePreview
            key={file.name}
            file={file}
            onRemove={() => handleRemoveFile(index)}
          />
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex items-end px-4 sm:px-6 py-2 sm:rounded-lg">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
        <div
          className={`flex-1 flex items-end gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 ${
            isMultiLine ? "rounded-lg" : "rounded-full"
          } bg-white dark:bg-gray-700`}
        >
          <button
            type="button"
            onClick={handleFileSelect}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown} 
            placeholder="Write your question..."
            rows={1}
            className="flex-1 bg-transparent dark:text-white focus:outline-none resize-none overflow-y-auto scrollbar-hide min-h-[24px]"
            style={{ lineHeight: "24px" }}
          />
        </div>
        <button
          type="submit"
          disabled={isResponding}
          className={`ml-2 w-10 h-10 flex items-center justify-center text-white rounded-full transform transition-all duration-200 ease-in-out ${
            isResponding
              ? "bg-gray-400 cursor-not-allowed opacity-50"
              : "bg-solace-blue dark:bg-solace-green hover:bg-blue-700 dark:hover:bg-green-600 hover:scale-105"
          }`}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}