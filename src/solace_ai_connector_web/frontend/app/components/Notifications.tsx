import React, { useRef } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

interface Notification {
  id: string;
  message: string;
}

interface NotificationsProps {
  notifications: Notification[];
  darkMode?: boolean;
}

export function Notifications({ notifications, darkMode }: Readonly<NotificationsProps>) {
  const nodeRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});

  const getNodeRef = (id: string) => {
    if (!nodeRefs.current[id]) {
      nodeRefs.current[id] = React.createRef<HTMLDivElement>();
    }
    return nodeRefs.current[id];
  };

  return (
    <div
      className="
        fixed w-full 
        top-[100px] sm:top-[80px]  
        px-4 md:px-0
        md:right-4 z-40 
        flex flex-col items-center md:items-end"
    >
      <TransitionGroup className="w-full md:w-auto">
        {notifications.map((notification) => {
          const nodeRef = getNodeRef(notification.id);
          return (
            <CSSTransition
              key={notification.id}
              nodeRef={nodeRef}
              timeout={300}
              classNames="notification"
            >
              <div
                ref={nodeRef}
                className={`
                  px-4 py-2 rounded-md shadow-lg mb-2 w-full md:w-auto
                  ${darkMode ? 'bg-solace-green text-white' : 'bg-solace-blue text-white'}
                  backdrop-blur-sm bg-opacity-90 md:max-w-md
                `}
              >
                {notification.message}
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    </div>
  );
}
