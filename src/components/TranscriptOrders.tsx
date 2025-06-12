import React from 'react';
import SummaryPanel from './SummaryPanel'
import TranscriptSummary from './TranscriptSummary';
import type { Transcript, AI_Summary, SummaryRef } from '@/types/types';

interface TranscriptOrdersProps {
  transcript: Transcript;
  summaryMap: Record<string, AI_Summary['arguments']['summaries'][0]>;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  summaryRef: React.RefObject<SummaryRef>;
}

const TranscriptOrders: React.FC<TranscriptOrdersProps> = ({
  transcript,
  summaryMap,
  onCopy,
  onMaximize,
  summaryRef
}) => {
  return (
    <SummaryPanel
      title="Orders"
      onCopy={onCopy}
      onMaximize={onMaximize}
      summaryRef={summaryRef}
    >
      {summaryMap['5'] && (
        <TranscriptSummary
          ref={summaryRef}
          summary={summaryMap['5']}
          transcript={transcript}
        />
      )}
    </SummaryPanel>
  );
};

export default TranscriptOrders;
