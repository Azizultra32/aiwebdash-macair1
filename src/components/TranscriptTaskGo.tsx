import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import TranscriptSummary from './TranscriptSummary';
import type { Transcript } from '@/types/types';

interface TranscriptTaskGoProps {
  transcript: Transcript;
  summaryMap: any;
  onCopy: (ref: any) => void;
  onMaximize: (ref: any) => void;
  summaryRef: React.RefObject<any>;
}

const TranscriptTaskGo: React.FC<TranscriptTaskGoProps> = ({
  transcript,
  summaryMap,
  onCopy,
  onMaximize,
  summaryRef
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center border-b pb-2">
          <CardTitle className="text-xl font-semibold text-primary-600">ARMADA-Task-GO</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onCopy(summaryRef)}
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onMaximize(summaryRef)}
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow min-h-0 pt-2 px-4 pb-4">
        {summaryMap['4'] && (
          <TranscriptSummary 
            ref={summaryRef}
            summary={summaryMap['4']} 
            transcript={transcript}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptTaskGo;
