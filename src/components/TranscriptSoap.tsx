import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import SummaryPanel from './SummaryPanel';
import TranscriptSummary from './TranscriptSummary';
import type { Transcript, SummaryRef, AI_Summary } from '@/types/types';

interface TranscriptSoapProps {
  transcript: Transcript;
  summaryMap: Record<string, AI_Summary['arguments']['summaries'][0]>;
  showDetail: boolean;
  setShowDetail: (show: boolean) => void;
  summaryRef: React.RefObject<SummaryRef>;
  handleCopy: (ref: React.RefObject<SummaryRef>) => void;
  handleMaximize: (ref: React.RefObject<SummaryRef>) => void;
  handlePrint: () => void;
}

const TranscriptSoap: React.FC<TranscriptSoapProps> = ({
  transcript,
  summaryMap,
  showDetail,
  setShowDetail,
  summaryRef,
  handleCopy,
  handleMaximize,
  handlePrint
}) => {
  return (
    <div className="w-full md:w-[45%] p-4 border-r border-border bg-gray-100 flex flex-col overflow-y-auto">
      <Card className="h-full flex flex-col">
        <SummaryPanel
          title={<span>S.O.A.P <sup className="text-sm">MD</sup></span>}
          onCopy={handleCopy}
          onMaximize={handleMaximize}
          onPrint={handlePrint}
          summaryRef={summaryRef}
        />
        <CardHeader className="pt-0">
          <div className="flex justify-end items-center gap-2">
            <span className="text-sm">detail</span>
            <Switch
              checked={showDetail}
              onCheckedChange={setShowDetail}
              className="data-[state=checked]:bg-blue-700"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow min-h-0 pt-2 px-4 pb-4">
          <TranscriptSummary
            ref={summaryRef}
            summary={summaryMap['1'] || { number: 1, summary: '' }}
            transcript={transcript}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptSoap;
