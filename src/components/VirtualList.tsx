import React from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

type ListChildRenderer = (index: number, style: React.CSSProperties) => React.ReactNode;

export interface VirtualListRef {
  scrollTo: (offset: number) => void;
}

interface VirtualListProps {
  itemCount: number;
  itemSize: number;
  overscan?: number;
  children: ListChildRenderer;
}

/**
 * Simple fixed size virtual list used when we cannot pull in react-window.
 * Renders only the visible rows plus overscan buffer.
 */
const VirtualList = forwardRef<VirtualListRef, VirtualListProps>(
  ({ itemCount, itemSize, overscan = 5, children }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);

    useImperativeHandle(ref, () => ({
      scrollTo: (offset: number) => {
        containerRef.current?.scrollTo({ top: offset });
      },
    }));

    const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollOffset(e.currentTarget.scrollTop);
    }, []);

    useEffect(() => {
      const handleResize = () => {
        if (containerRef.current) {
          setHeight(containerRef.current.clientHeight);
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startIndex = Math.max(0, Math.floor(scrollOffset / itemSize) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.floor((scrollOffset + height) / itemSize) + overscan,
    );

    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push(
        children(i, {
          position: 'absolute',
          top: i * itemSize,
          height: itemSize,
          width: '100%',
        }),
      );
    }

    return (
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="overflow-y-auto relative flex-1"
      >
        <div style={{ height: itemCount * itemSize }} className="relative">
          {items}
        </div>
      </div>
    );
  },
);

export default VirtualList;
