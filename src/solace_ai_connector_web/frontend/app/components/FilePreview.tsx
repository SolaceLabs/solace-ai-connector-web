interface FilePreviewProps {
    file: File;
    onRemove: () => void;
  }
  
  const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
    return (
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 max-w-fit">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
          type="button"
        >
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };
  
  export default FilePreview;