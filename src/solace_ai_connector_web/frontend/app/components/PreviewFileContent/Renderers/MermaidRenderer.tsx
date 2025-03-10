import React, { useState, useEffect } from 'react';
import { BaseRendererProps } from './types';

const MermaidRenderer: React.FC<BaseRendererProps> = ({ content, width }) => {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    setSrcDoc(`<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/panzoom@9.4.0/dist/panzoom.min.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            mermaid.initialize({
              startOnLoad: true,
              theme: 'default',
              fontFamily: 'arial, sans-serif',
              logLevel: 'error',
              securityLevel: 'strict'
            });
            
            // Initialize panzoom after Mermaid rendering
            mermaid.run().then(() => {
              const diagramContainer = document.getElementById('diagram-container');
              if (diagramContainer) {
                const pz = panzoom(diagramContainer, {
                  maxZoom: 10,
                  minZoom: 0.1,
                  smoothScroll: true,
                  bounds: true,
                  boundsPadding: 0.1
                });
                
                // Add zoom controls
                document.getElementById('reset').addEventListener('click', () => {
                  pz.moveTo(0, 0);
                  pz.zoomAbs(0, 0, 1);
                });
              }
            });
            
            // Listen for message to send SVG data back to parent
            window.addEventListener('message', function(event) {
              if (event.data && event.data.action === 'getMermaidSvg') {
                const svgElement = document.querySelector('.mermaid svg');
                if (svgElement) {
                  const svgData = new XMLSerializer().serializeToString(svgElement);
                  window.parent.postMessage({
                    action: 'downloadSvg',
                    svgData: svgData,
                    filename: event.data.filename || 'mermaid-diagram.svg'
                  }, '*');
                } else {
                  console.error('SVG element not found');
                }
              }
            });
          });
        </script>
        <style>
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: Arial, sans-serif;
          }
          .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
          }
          .diagram-wrapper {
            flex: 1;
            overflow: hidden;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f9f9f9;
          }
          #diagram-container {
            transform-origin: 0 0;
            cursor: grab;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: white;
            padding: 20px;
            border-radius: 5px;
          }
          #diagram-container:active {
            cursor: grabbing;
          }
          .mermaid {
            display: flex;
            justify-content: center;
          }
          .controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 5px;
          }
          .control-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background-color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .control-btn:hover {
            background-color: #f0f0f0;
          }
          .instructions {
            position: fixed;
            top: 10px;
            left: 10px;
            background-color: rgba(255,255,255,0.8);
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="diagram-wrapper">
            <div id="diagram-container">
              <div class="mermaid">
                ${content}
              </div>
            </div>
          </div>
          <div class="instructions">
            Drag to pan and scroll to zoom
          </div>
          <div class="controls">
            <button id="reset" class="control-btn">↺</button>
          </div>
        </div>
      </body>
      </html>`);
  }, [content]);

  return (
    <div
      className="bg-white rounded-md overflow-hidden shadow-md"
      style={{ maxWidth: `${width}px`, height: 'calc(100vh - 200px)' }}
    >
      <iframe
        srcDoc={srcDoc}
        title="Mermaid Diagram"
        sandbox="allow-scripts allow-same-origin allow-downloads"
        className="w-full h-full border-none"
      />
    </div>
  );
};

export default MermaidRenderer;