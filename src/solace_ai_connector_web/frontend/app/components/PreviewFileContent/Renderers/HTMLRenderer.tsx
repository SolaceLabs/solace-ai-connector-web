import React, { useState, useEffect } from 'react';
import { BaseRendererProps } from './types';

export const HtmlRenderer: React.FC<BaseRendererProps> = ({ content, width }) => {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    // Wrap scripts to avoid global scope pollution
    const wrappedContent = content.replace(
      /<script>([\s\S]*?)<\/script>/g,
      (match: string, scriptContent: string) => {
        return `<script>(function() {\n${scriptContent}\n})();</script>`;
      }
    );
    setSrcDoc(wrappedContent);
  }, [content]);

  return (
    <div
      className="bg-white rounded-md overflow-hidden shadow-md"
      style={{ maxWidth: `${width}px`, height: 'calc(100vh - 200px)' }}
    >
      <iframe
        srcDoc={srcDoc}
        title="HTML Preview"
        sandbox="allow-scripts allow-same-origin allow-downloads"
        className="w-full h-full border-none"
      />
    </div>
  );
};