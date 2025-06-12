import React from 'react';
import SummaryPanel from './SummaryPanel'
import TranscriptSummary from './TranscriptSummary';
import type { Transcript, AI_Summary, SummaryRef } from '@/types/types';

interface TranscriptConsultWizardProps {
  transcript: Transcript;
  summaryMap: Record<string, AI_Summary['arguments']['summaries'][0]>;
  onCopy: (ref: React.RefObject<SummaryRef>) => void;
  onMaximize: (ref: React.RefObject<SummaryRef>) => void;
  summaryRef: React.RefObject<SummaryRef>;
}

const TranscriptConsultWizard: React.FC<TranscriptConsultWizardProps> = ({
  transcript,
  summaryMap,
  onCopy,
  onMaximize,
  summaryRef
}) => {
  return (
    <SummaryPanel
      title="Consult Wizard"
      onCopy={onCopy}
      onMaximize={onMaximize}
      summaryRef={summaryRef}
    >
      {summaryMap['3'] && (
        <TranscriptSummary
          ref={summaryRef}
          summary={summaryMap['3']}
          transcript={transcript}
        />
      )}
    </SummaryPanel>
  );
};

export default TranscriptConsultWizard;
