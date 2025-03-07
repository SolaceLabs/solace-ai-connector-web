import React, { useState, useRef } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

export interface StatusMessage {
  id: string;
  message: string;
}

interface StatusLogProps {
  statusMessages: StatusMessage[];
  onClearStatusMessages: () => void;
  darkMode?: boolean;
}

export function StatusLog({ 
  statusMessages, 
  onClearStatusMessages,
  darkMode 
}: Readonly<StatusLogProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const nodeRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});

  const getNodeRef = (id: string) => {
    if (!nodeRefs.current[id]) {
      nodeRefs.current[id] = React.createRef<HTMLDivElement>();
    }
    return nodeRefs.current[id];
  };

  // If there are no status messages, don't render anything
  if (statusMessages.length === 0) return null;

  const currentStatus = statusMessages[statusMessages.length - 1];
  
  return (
    <div className="fixed w-full top-[100px] sm:top-[80px] z-40 px-4 md:px-0 flex flex-col items-center">
      <div className={`
        w-11/12 md:w-2/4 mx-auto 
        rounded-lg shadow-md 
        transition-all duration-300 ease-in-out
        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
        border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
      `}>
        {/* Current status with controls */}
        <div className="flex justify-between items-center">
          <div 
            className={`
              px-4 py-3 cursor-pointer flex-grow
              flex items-center space-x-3
              ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
            `}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className={`flex-shrink-0 h-2 w-2 rounded-full animate-pulse ${darkMode ? 'bg-solace-green' : 'bg-solace-blue'}`}></span>
            <span className="truncate">{currentStatus.message}</span>
          </div>
          
          <div className="flex items-center pr-3">
            <button 
              className={`p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
              onClick={onClearStatusMessages}
              aria-label="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Collapsible history */}
        {isExpanded && statusMessages.length > 1 && (
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} max-h-60 overflow-y-auto`}>
            <TransitionGroup className="divide-y divide-gray-200 dark:divide-gray-700">
              {statusMessages.slice(0, -1).reverse().map((status) => {
                const nodeRef = getNodeRef(status.id);
                return (
                  <CSSTransition
                    key={status.id}
                    nodeRef={nodeRef}
                    timeout={300}
                    classNames="status-item"
                  >
                    <div 
                      ref={nodeRef}
                      className={`
                        px-4 py-2.5
                        ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                        flex justify-between items-center
                      `}
                    >
                      <span className="text-sm">{status.message}</span>
                    </div>
                  </CSSTransition>
                );
              })}
            </TransitionGroup>
          </div>
        )}
      </div>
    </div>
  );
}