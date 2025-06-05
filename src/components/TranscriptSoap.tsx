import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Copy, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
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
}

const TranscriptSoap: React.FC<TranscriptSoapProps> = ({
  transcript,
  summaryMap,
  showDetail,
  setShowDetail,
  summaryRef,
  handleCopy,
  handleMaximize
}) => {
  return (
    <div className="w-full md:w-[45%] p-4 border-r border-border bg-gray-100 flex flex-col overflow-y-auto">
      <Card className="h-full flex flex-col">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center border-b pb-2">
            <CardTitle className="text-2xl font-semibold text-primary-600">
              S.O.A.P <sup className="text-sm">MD</sup>
            </CardTitle>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(summaryRef)}
                >
                  <Copy className="h-5 w-5" />
                  <span className="sr-only">Copy summary</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMaximize(summaryRef)}
                >
                  <Maximize2 className="h-5 w-5" />
                  <span className="sr-only">Maximize summary</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">detail</span>
                <Switch
                  checked={showDetail}
                  onCheckedChange={setShowDetail}
                  className="data-[state=checked]:bg-blue-700"
                />
              </div>
            </div>
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
