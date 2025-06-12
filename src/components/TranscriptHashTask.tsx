import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import SummaryPanel from './SummaryPanel';
import TranscriptSummary from './TranscriptSummary';
import type { Transcript, AI_Summary, SummaryRef } from '@/types/types';

interface TranscriptHashTaskProps {
  transcript: Transcript;
  summaryMap: Record<string, AI_Summary['arguments']['summaries'][0]>;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  onPrint: () => void;
  summaryRef: React.RefObject<SummaryRef>;
}

const TranscriptHashTask: React.FC<TranscriptHashTaskProps> = ({
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
        title="#-Task"
        onCopy={onCopy}
        onMaximize={onMaximize}
        onPrint={onPrint}
        summaryRef={summaryRef}
      />
      <CardContent className="flex-grow min-h-0 pt-2 px-4 pb-4">
        {summaryMap['6'] && (
          <TranscriptSummary 
            ref={summaryRef}
            summary={summaryMap['6']} 
            transcript={transcript}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptHashTask;
