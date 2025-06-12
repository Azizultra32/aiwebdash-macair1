import React from 'react';
import SummaryPanel from './SummaryPanel'
import TranscriptSummary from './TranscriptSummary';
import type { Transcript, AI_Summary, SummaryRef } from '@/types/types';

interface TranscriptLooperProps {
  transcript: Transcript;
  summaryMap: Record<string, AI_Summary['arguments']['summaries'][0]>;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  summaryRef: React.RefObject<SummaryRef>;
}

const TranscriptLooper: React.FC<TranscriptLooperProps> = ({
  transcript,
  summaryMap,
  onCopy,
  onMaximize,
  summaryRef
}) => {
  return (
    <SummaryPanel
      title="Looper"
      onCopy={onCopy}
      onMaximize={onMaximize}
      summaryRef={summaryRef}
    >
      {summaryMap['2'] && (
        <TranscriptSummary
          ref={summaryRef}
          summary={summaryMap['2']}
          transcript={transcript}
        />
      )}
    </SummaryPanel>
  );
};

export default TranscriptLooper;
