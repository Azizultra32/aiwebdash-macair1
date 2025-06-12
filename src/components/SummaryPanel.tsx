import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Maximize2, Printer } from 'lucide-react';
import { Button } from './ui/button';
import type { SummaryRef } from '@/types/types';

interface SummaryPanelProps {
  title: string;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  onPrint: () => void;
  summaryRef: React.RefObject<SummaryRef>;
}

/**
 * Common header section for transcript summaries with copy,
 * maximize and print actions.
 */
const SummaryPanel: React.FC<SummaryPanelProps> = ({
  title,
  onCopy,
  onMaximize,
  onPrint,
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
        <Button variant="ghost" size="sm" onClick={onPrint}>
          <Printer className="h-5 w-5" />
          <span className="sr-only">Print summary</span>
        </Button>
      </div>
    </div>
  </CardHeader>
);

export default SummaryPanel;
