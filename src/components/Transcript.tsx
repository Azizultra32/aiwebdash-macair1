import { useRef, useState } from 'react';
import { useTranscriptFeatures } from '@/hooks/useTranscriptFeatures';
import type { Transcript as TranscriptType } from '@/types/types';
import { useCopyToClipboard } from 'usehooks-ts';
import TranscriptSoap from './TranscriptSoap';
import TranscriptTabs from './TranscriptTabs';
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

type Props = {
  transcript: TranscriptType;
  recordingPatientMidUUID: string | undefined;
  uploadingPatientMidUUID: string | undefined;
};

const ToggleButton = ({ label, checked, onCheckedChange }: any) => (
  <motion.div
    className="flex items-center space-x-2"
    initial={false}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  >
    <span className="text-sm">{label}</span>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="data-[state=checked]:bg-black"
    />
  </motion.div>
);

const Transcript = ({ transcript }: Props) => {
  const { features, toggleFeature } = useTranscriptFeatures();
  const [activeTab, setActiveTab] = useState("consult");
  const [showDetail, setShowDetail] = useState(false);
  const [_, copy] = useCopyToClipboard();

  const summaryMap = (showDetail ? transcript.ai_summary : transcript.ai_short_summary)?.arguments?.summaries?.reduce((acc: any, latest) => {
    acc[latest.number.toString()] = latest;
    return acc;
  }, { '-1': { number: -1, summary: '' } }) ?? {};

  // Create refs for each summary
  const summaryRefs = {
    '1': useRef(null),
    '2': useRef(null),
    '3': useRef(null),
    '4': useRef(null),
    '5': useRef(null),
    '6': useRef(null),
    '9': useRef(null),
  };

  const handleCopy = (ref: any) => {
    if (ref.current) {
      const text = ref.current.getSummary();
      copy(text);
    }
  };

  const handleMaximize = (ref: any) => {
    if (ref.current) {
      ref.current.toggleMaximize();
    }
  };

  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
      <TranscriptSoap 
        transcript={transcript}
        summaryMap={summaryMap}
        showDetail={showDetail}
        setShowDetail={setShowDetail}
        summaryRef={summaryRefs['1']}
        handleCopy={handleCopy}
        handleMaximize={handleMaximize}
      />
      
      <div className="flex-1 flex flex-col" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
        <div className="flex justify-end p-4 space-x-4 bg-gray-100">
          <ToggleButton
            label="looper"
            checked={features.looper}
            onCheckedChange={() => toggleFeature('looper')}
          />
          <ToggleButton
            label="assist patient"
            checked={features.assistPatient}
            onCheckedChange={() => toggleFeature('assistPatient')}
          />
          <ToggleButton
            label="task-go"
            checked={features.taskGo}
            onCheckedChange={() => toggleFeature('taskGo')}
          />
          <ToggleButton
            label="#task"
            checked={features.hashTask}
            onCheckedChange={() => toggleFeature('hashTask')}
          />
        </div>
        <TranscriptTabs
          transcript={transcript}
          summaryMap={summaryMap}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          summaryRefs={summaryRefs}
          handleCopy={handleCopy}
          handleMaximize={handleMaximize}
          features={features}
        />
      </div>
    </div>
  );
};

export default Transcript;
