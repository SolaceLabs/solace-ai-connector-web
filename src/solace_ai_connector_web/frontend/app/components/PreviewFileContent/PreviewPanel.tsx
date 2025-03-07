import { useState, useRef, useEffect, useMemo } from 'react';
import { FileAttachment } from '../FileDisplay';
import HtmlPreviewPanel from './HtmlPreviewPanel';
import { isHtmlFile, isMermaidFile, isCsvFile } from './PreviewHelpers';
import { CsvPreviewPanel } from './CsvPreviewPanel';

interface PreviewPanelProps {
  file: FileAttachment;
  onClose: () => void;
  initialWidth?: number;
  autoRun?: boolean;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  file, 
  onClose, 
  initialWidth = window.innerWidth * 0.4,
  autoRun = false
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isRendering, setIsRendering] = useState(autoRun);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Decode base64 content
  const decodedContent = atob(file.content);
  
  // Check if content is CSV or HTML
  const isCsvContent = isCsvFile(file.name);
  const isHtmlContent = isHtmlFile(file.name);
  const isMermaidContent = isMermaidFile(file.name);

  useEffect(() => {
    if ((isHtmlContent || isMermaidContent) && autoRun) {
      setIsRendering(true);
    }
  }, [autoRun, file, isHtmlContent, isMermaidContent]);
  
  // Add a class to the body when resizing to prevent text selection
  useEffect(() => {
    if (isResizing) {
      document.body.classList.add('resize-active');
    } else {
      document.body.classList.remove('resize-active');
    }
    
    return () => {
      document.body.classList.remove('resize-active');
    };
  }, [isResizing]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Prevent text selection during resize
      e.preventDefault();
      
      const containerWidth = document.body.clientWidth;
      const newWidth = containerWidth - e.clientX;
      
      // Set min and max width constraints
      const constrainedWidth = Math.max(300, Math.min(newWidth, containerWidth * 0.7));
      
      setWidth(constrainedWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };
  
  const toggleRendering = () => {
    setIsRendering(prev => !prev);
  };
  
  return (
    <div 
      ref={panelRef}
      className={`fixed top-[72px] right-0 bottom-0 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 z-30 flex flex-col ${isResizing ? 'select-none' : ''}`}
      style={{ width: `${width}px` }}
    >
      {/* Resizing handle */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-1 cursor-col-resize hover:bg-solace-blue dark:hover:bg-solace-green"
        onMouseDown={handleMouseDown}
      />
      
      {/* Header with Run/Stop button */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          Preview: {file.name}
        </h3>
        <div className="flex items-center">
          {/* Only show Run button for supported content */}
          {(isHtmlContent || isMermaidContent) && (
            <button
              onClick={toggleRendering}
              className="px-2 py-1 mr-2 rounded-md bg-gray-200 dark:bg-solace-green hover:bg-gray-300 dark:hover:bg-green-600 text-xs font-medium"
            >
              {isRendering ? 'Stop' : 'Run'}
            </button>
          )}

          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg 
              className="w-5 h-5 text-gray-500 dark:text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content section*/}
      <div className="flex-1 pt-4 px-4 pb-8 overflow-auto">
        {isCsvContent ? (
          <CsvPreviewPanel content={decodedContent} width={width - 32} />
        ) : (isHtmlContent || isMermaidContent) && isRendering ? (
          <HtmlPreviewPanel 
            content={decodedContent} 
            width={width - 32}
            isMermaid={isMermaidContent}
          />
        ) : (
          <pre className="text-xs md:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {decodedContent}
          </pre>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;