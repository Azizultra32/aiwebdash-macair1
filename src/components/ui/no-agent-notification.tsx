import { useState, useEffect } from 'react';

export interface NoAgentNotificationProps {
  isVisible?: boolean;
  onClose?: () => void;
  autoHideDelay?: number;
}

export function NoAgentNotification(props: NoAgentNotificationProps) {
  const {
    isVisible = true,
    onClose,
    autoHideDelay = 10000, // 10 seconds
  } = props;

  const [showNotification, setShowNotification] = useState(isVisible);

  useEffect(() => {
    setShowNotification(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (!showNotification || !autoHideDelay) return;

    const timer = setTimeout(() => {
      setShowNotification(false);
      onClose?.();
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [showNotification, autoHideDelay, onClose]);

  const handleClose = () => {
    setShowNotification(false);
    onClose?.();
  };

  if (!showNotification) {
    return null;
  }

  return (
    <>
      {showNotification ? (
        <div className="fixed text-sm left-3/4 max-w-[90vw] -translate-x-1/2 flex top-6 items-center gap-4 bg-muted text-muted-foreground px-4 py-3 rounded-lg z-10">
          <div>
            {/* Warning Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.85068 3.63564C10.8197 2.00589 13.1793 2.00589 14.1484 3.63564L21.6323 16.2223C22.6232 17.8888 21.4223 20 19.4835 20H4.51555C2.57676 20 1.37584 17.8888 2.36671 16.2223L9.85068 3.63564ZM12 8.5C12.2761 8.5 12.5 8.72386 12.5 9V13.5C12.5 13.7761 12.2761 14 12 14C11.7239 14 11.5 13.7761 11.5 13.5V9C11.5 8.72386 11.7239 8.5 12 8.5ZM12.75 16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16C11.25 15.5858 11.5858 15.25 12 15.25C12.4142 15.25 12.75 15.5858 12.75 16Z"
                fill="hsl(var(--muted-foreground))"
              />
            </svg>
          </div>
          <span>No agent configured. Some features may not work correctly.</span>
          <button onClick={handleClose} className="ml-auto">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.16602 3.16666L12.8327 12.8333M12.8327 3.16666L3.16602 12.8333"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
