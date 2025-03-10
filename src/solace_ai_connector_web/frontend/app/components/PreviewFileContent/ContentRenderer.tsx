import React from 'react';
import {HtmlRenderer} from './Renderers/HTMLRenderer';
import {MermaidRenderer} from './Renderers/MermaidRenderer';

export type RendererType = 'html' | 'mermaid';

interface ContentRendererProps {
  content: string;
  width: number;
  rendererType: RendererType;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  width,
  rendererType,
}) => {
  // Delegate to the appropriate renderer based on rendererType
  switch (rendererType) {
    case 'mermaid':
      return <MermaidRenderer content={content} width={width} />;
    case 'html':
      return <HtmlRenderer content={content} width={width} />;
    default:
      return <div>Unsupported content type</div>;
  }
};