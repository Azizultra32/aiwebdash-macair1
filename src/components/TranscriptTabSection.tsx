import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import type { SummaryRef } from '@/types/types';

interface TranscriptTabSectionProps {
  title: string;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  summaryRef: React.RefObject<SummaryRef>;
}

/**
 * Header section used across transcript tab components.
 */
const TranscriptTabSection: React.FC<TranscriptTabSectionProps> = ({
  title,
  onCopy,
  onMaximize,
  summaryRef,
}) => (
  <CardHeader className="p-4 pb-2">
    <div className="flex justify-between items-center border-b pb-2">
      <CardTitle className="text-xl font-semibold text-primary-600">{title}</CardTitle>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onCopy(summaryRef)}>
          <Copy className="h-5 w-5" />
          <span className="sr-only">Copy summary</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onMaximize(summaryRef)}>
          <Maximize2 className="h-5 w-5" />
          <span className="sr-only">Maximize summary</span>
        </Button>
      </div>
    </div>
  </CardHeader>
);

export default TranscriptTabSection;
