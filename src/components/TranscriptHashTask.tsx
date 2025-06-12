import React from 'react';
import SummaryPanel from './SummaryPanel'
import TranscriptSummary from './TranscriptSummary';
import type { Transcript, AI_Summary, SummaryRef } from '@/types/types';

interface TranscriptHashTaskProps {
  transcript: Transcript;
  summaryMap: Record<string, AI_Summary['arguments']['summaries'][0]>;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  summaryRef: React.RefObject<SummaryRef>;
}

const TranscriptHashTask: React.FC<TranscriptHashTaskProps> = ({
  transcript,
  summaryMap,
  onCopy,
  onMaximize,
  summaryRef
}) => {
  return (
    <SummaryPanel
      title="#-Task"
      onCopy={onCopy}
      onMaximize={onMaximize}
      summaryRef={summaryRef}
    >
      {summaryMap['6'] && (
        <TranscriptSummary
          ref={summaryRef}
          summary={summaryMap['6']}
          transcript={transcript}
        />
      )}
    </SummaryPanel>
  );
};

export default TranscriptHashTask;
