import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import MicReactiveScanner from './kitt-scanner-component';

interface WidgetAction {
  label: string;
  onClick: () => void;
}

interface FloatingWidgetProps {
  show: boolean;
  isActivated: boolean;
  actions?: WidgetAction[];
}

const FloatingWidget = ({ show, isActivated, actions = [] }: FloatingWidgetProps) => {
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (dragging.current) {
      setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    }
  };

  const onMouseUp = () => { dragging.current = false; };

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 p-2 bg-white shadow-lg rounded-md select-none"
    >
      <div onMouseDown={onMouseDown} className="cursor-move font-semibold mb-2">
        Controls
      </div>
      <MicReactiveScanner isActivated={isActivated} />
      {actions.map((action, idx) => (
        <Button key={idx} className="mt-2 w-full" onClick={action.onClick}>
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default FloatingWidget;
