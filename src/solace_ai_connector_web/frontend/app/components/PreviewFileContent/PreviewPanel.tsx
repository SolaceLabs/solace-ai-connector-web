import { useState, useRef, useEffect, useMemo } from 'react';
import { FileAttachment } from '../FileDisplay';
import { SandpackPreviewRef } from '@codesandbox/sandpack-react/unstyled';
import HtmlPreviewPanel from './HtmlPreviewPanel';

interface PreviewPanelProps {
  file: FileAttachment;
  onClose: () => void;
  initialWidth?: number;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  file, 
  onClose, 
  initialWidth = 600 
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<SandpackPreviewRef>(null);
  
  // Decode base64 content
  const decodedContent = atob(file.content);
  
  // Check if content is CSV or HTML
  const isCsvContent = useCsvDetection(file.name, decodedContent);
  const isHtmlContent = useHtmlDetection(file.name, decodedContent);
  
  // Reset rendering state when file changes
  useEffect(() => {
    setIsRendering(false);
  }, [file]);
  
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
          {isHtmlContent && (
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
        ) : isHtmlContent && isRendering ? (
          <HtmlPreviewPanel 
            content={decodedContent} 
            width={width - 32} 
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

// Modified CsvPreview for Panel component
const CsvPreviewPanel: React.FC<{content: string; width: number}> = ({ content, width }) => {
  const rows = useMemo(() => {
    try {
      const lines = content.trim().split('\n');
      const parsed = lines
        .filter(line => line.trim())
        .map(line => line.split(',').map(cell => cell.trim()));
      
      return parsed;
    } catch (e) {
      return [];
    }
  }, [content]);

  if (!rows.length) {
    return <div className="text-gray-500 dark:text-gray-400">No valid CSV content found</div>;
  }

  return (
    <div 
      className="overflow-x-auto scrollbar-themed" 
      style={{ maxWidth: `${width}px`, maxHeight: 'calc(100vh - 200px)' }}
    >
      <table className="min-w-full text-sm dark:text-gray-200">
        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
          {rows.length > 0 && (
            <tr>
              {rows[0].map((header, i) => (
                <th key={i} className="border border-gray-200 dark:border-gray-600 p-2 font-medium text-left dark:text-white">
                  {header}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr 
              key={i} 
              className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
            >
              {row.map((cell, j) => (
                <td 
                  key={j} 
                  className="border border-gray-200 dark:border-gray-600 p-2 truncate dark:text-white"
                  title={cell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to detect if content is CSV
function useCsvDetection(fileName: string, content: string): boolean {
  return (
    fileName.toLowerCase().endsWith('.csv') || 
    (
      content.includes(',') && 
      content.split('\n').length > 1 && 
      content.split('\n')[0].split(',').length > 1 &&
      content.split('\n').every(line => 
        line.trim() === '' || line.split(',').length === content.split('\n')[0].split(',').length
      )
    )
  );
}

function useHtmlDetection(fileName: string, content: string): boolean {
    // Check file extension
    if (fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm')) {
      return true;
    }
    
    // Check for HTML content patterns
    const normalizedContent = content.trim().toLowerCase();
    return (
      normalizedContent.startsWith('<!doctype html>') ||
      normalizedContent.startsWith('<html') ||
      (normalizedContent.includes('<body') && normalizedContent.includes('</body>')) ||
      (normalizedContent.includes('<head') && normalizedContent.includes('</head>'))
    );
  }

export default PreviewPanel;