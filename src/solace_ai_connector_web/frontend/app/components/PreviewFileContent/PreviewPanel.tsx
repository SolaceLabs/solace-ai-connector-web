import { useState, useRef, useEffect } from 'react';
import { FileAttachment } from '../FileDisplay';
import { isHtmlFile, isMermaidFile, isCsvFile } from './PreviewHelpers';
import { CsvPreviewPanel } from './CsvPreviewPanel';
import {ContentRenderer} from './ContentRenderer';

interface PreviewPanelProps {
  file: FileAttachment;
  onClose: () => void;
  initialWidth?: number;
  autoRun?: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
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
  
  // Add message listener for SVG download
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action === 'downloadSvg') {
        const svgBlob = new Blob([event.data.svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.download = event.data.filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleDownloadMermaid = () => {
    const iframe = panelRef.current?.querySelector('iframe');
    if (iframe?.contentWindow) {
      const targetOrigin = window.location.origin;
      
      iframe.contentWindow.postMessage({
        action: 'getMermaidSvg',
        filename: `${file.name.replace(/\.[^/.]+$/, '')}.svg`
      }, targetOrigin);
    }
  };
  
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
        <div className="flex items-center space-x-2">
          {/* Only show Run button for supported content */}
          {(isHtmlContent || isMermaidContent) && (
            <button
              onClick={toggleRendering}
              className={`px-3 py-1.5 rounded-full text-white shadow-sm transition-all duration-150 text-xs font-medium flex items-center ${
                isRendering 
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
              }`}
            >
              {isRendering ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Run
                </>
              )}
            </button>
          )}
          {/* SVG Download button for Mermaid */}
          {isMermaidContent && isRendering && (
            <button 
              onClick={handleDownloadMermaid} 
              className="px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white shadow-sm transition-all duration-150 text-xs font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              SVG
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
          <ContentRenderer 
            content={decodedContent} 
            width={width - 32}
            rendererType={isMermaidContent ? 'mermaid' : 'html'}
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