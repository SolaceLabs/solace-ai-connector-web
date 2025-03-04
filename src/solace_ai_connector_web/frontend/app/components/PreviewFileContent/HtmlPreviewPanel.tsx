import React, { useRef, useEffect } from 'react';

interface HtmlPreviewPanelProps {
  content: string;
  width: number;
}

const HtmlPreviewPanel: React.FC<HtmlPreviewPanelProps> = ({ 
  content, 
  width
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Re-render when content changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  }, [content]);

  return (
    <div 
      className="bg-white rounded-md overflow-hidden shadow-md" 
      style={{ maxWidth: `${width}px`, height: 'calc(100vh - 200px)' }}
    >
      <iframe
        ref={iframeRef}
        title="HTML Preview"
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-none"
      />
    </div>
  );
};

export default HtmlPreviewPanel;