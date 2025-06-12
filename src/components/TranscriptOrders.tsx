import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import SummaryPanel from './SummaryPanel';
import TranscriptSummary from './TranscriptSummary';
import type { Transcript, AI_Summary, SummaryRef } from '@/types/types';

interface TranscriptOrdersProps {
  transcript: Transcript;
  summaryMap: Record<string, AI_Summary['arguments']['summaries'][0]>;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  onPrint: () => void;
  summaryRef: React.RefObject<SummaryRef>;
}

const TranscriptOrders: React.FC<TranscriptOrdersProps> = ({
  transcript,
  summaryMap,
  onCopy,
  onMaximize,
  onPrint,
  summaryRef
}) => {
  return (
    <Card className="h-full flex flex-col">
      <SummaryPanel
        title="Orders"
        onCopy={onCopy}
        onMaximize={onMaximize}
        onPrint={onPrint}
        summaryRef={summaryRef}
      />
      <CardContent className="flex-grow min-h-0 pt-2 px-4 pb-4">
        {summaryMap['5'] && (
          <TranscriptSummary 
            ref={summaryRef}
            summary={summaryMap['5']} 
            transcript={transcript}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptOrders;
