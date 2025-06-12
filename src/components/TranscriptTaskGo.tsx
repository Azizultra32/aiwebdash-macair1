import React from 'react';
import SummaryPanel from './SummaryPanel'
import TranscriptSummary from './TranscriptSummary';
import type { Transcript, AI_Summary, SummaryRef } from '@/types/types';

interface TranscriptTaskGoProps {
  transcript: Transcript;
  summaryMap: Record<string, AI_Summary['arguments']['summaries'][0]>;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  summaryRef: React.RefObject<SummaryRef>;
}

const TranscriptTaskGo: React.FC<TranscriptTaskGoProps> = ({
  transcript,
  summaryMap,
  onCopy,
  onMaximize,
  summaryRef
}) => {
  return (
    <SummaryPanel
      title="ARMADA-Task-GO"
      onCopy={onCopy}
      onMaximize={onMaximize}
      summaryRef={summaryRef}
    >
      {summaryMap['4'] && (
        <TranscriptSummary
          ref={summaryRef}
          summary={summaryMap['4']}
          transcript={transcript}
        />
      )}
    </SummaryPanel>
  );
};

export default TranscriptTaskGo;
