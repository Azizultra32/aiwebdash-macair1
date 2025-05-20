import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import TranscriptTabSection from './TranscriptTabSection';
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
    <Card className="h-full flex flex-col">
      <TranscriptTabSection
        title="Consult Wizard"
        onCopy={onCopy}
        onMaximize={onMaximize}
        summaryRef={summaryRef}
      />
      <CardContent className="flex-grow min-h-0 pt-2 px-4 pb-4">
        {summaryMap['3'] && (
          <TranscriptSummary
            ref={summaryRef}
            summary={summaryMap['3']}
            transcript={transcript}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptConsultWizard;
