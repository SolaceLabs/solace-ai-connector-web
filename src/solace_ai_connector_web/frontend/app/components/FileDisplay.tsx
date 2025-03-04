import { PreviewContent } from "./PreviewFileContent/PreviewContent";

export interface FileAttachment {
  name: string;
  content: string;
  mime_type?: string;
}

interface FileDisplayProps {
  file: FileAttachment;
  onPreview?: (file: FileAttachment) => void;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ file, onPreview }) => {
  const isImage = file.mime_type?.startsWith("image/");
  const isTextBased =
    file.mime_type?.startsWith("text/") ||
    file.name.match(/\.(txt|json|csv|md|log|html|htm|css|js)$/i);

  // Check if this file type is previewable in panel
  const isPreviewable = file.name.match(/\.(html|htm)$/i);

  const handleDownload = () => {
    const blob = new Blob(
      [Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0))],
      { type: file.mime_type ?? "application/octet-stream" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isImage) {
    return (
      <div className="w-full max-w-[85vw] md:max-w-md">
        <img
          src={`data:${file.mime_type};base64,${file.content}`}
          alt={file.name}
          className="w-full h-auto object-contain rounded-lg shadow-md"
        />
        <div className="mt-2">
          <FileRow 
            filename={file.name} 
            onDownload={handleDownload}
            onPreview={isPreviewable && onPreview ? () => onPreview(file) : undefined}
          />
        </div>
      </div>
    );
  }
  if (isTextBased) {
    return (
      <div className="w-full max-w-[80vw] md:max-w-md ">
        <PreviewContent 
          file={file} 
          onDownload={handleDownload}
          onPreview={isPreviewable && onPreview ? () => onPreview(file) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[80vw] md:max-w-md">
      <FileRow 
        filename={file.name} 
        onDownload={handleDownload}
        onPreview={isPreviewable && onPreview ? () => onPreview(file) : undefined}
      />
    </div>
  );
};

export const FileRow: React.FC<{ 
  filename: string; 
  onDownload?: () => void;
  onPreview?: () => void;
}> = ({
  filename,
  onDownload,
  onPreview,
}) => (
  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1.5 md:p-2 w-full max-w-[85vw] md:max-w-md">
    <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
      <div className="bg-gray-200 dark:bg-gray-600 p-1.5 md:p-2 rounded flex-shrink-0">
        <svg
          className="w-4 h-4 md:w-5 md:h-5 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 truncate">
        {filename}
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      {onPreview && (
        <button
          onClick={onPreview}
          className="flex-shrink-0 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 md:px-3 py-1 rounded text-xs md:text-sm hover:opacity-80 transition-opacity"
        >
          Preview
        </button>
      )}
      {onDownload && (
        <button
          onClick={onDownload}
          className="flex-shrink-0 bg-solace-blue dark:bg-solace-green text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm hover:opacity-80 transition-opacity"
        >
          Download
        </button>
      )}
    </div>
  </div>
);

export default FileDisplay;