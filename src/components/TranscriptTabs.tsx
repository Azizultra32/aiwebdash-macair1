/// <reference types="react" />
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { Transcript, SummaryRef } from '../types/types';
import TranscriptConsultWizard from './TranscriptConsultWizard.tsx';
import TranscriptOrders from './TranscriptOrders.tsx';
import TranscriptLooper from './TranscriptLooper.tsx';
import TranscriptAssistPatient from './TranscriptAssistPatient.tsx';
import TranscriptTaskGo from './TranscriptTaskGo.tsx';
import TranscriptHashTask from './TranscriptHashTask.tsx';
import FloatingAfterscribe from './FloatingAfterscribe';

interface TranscriptTabsProps {
  transcript: Transcript;
  summaryMap: Record<string, { links: string[]; title: string; number: number; summary: string }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  summaryRefs: {
    [key: string]: React.RefObject<SummaryRef>;
  };
  handleCopy: (ref: React.RefObject<SummaryRef>) => void;
  handleMaximize: (ref: React.RefObject<SummaryRef>) => void;
  features: {
    looper: boolean;
    assistPatient: boolean;
    taskGo: boolean;
    hashTask: boolean;
  };
}

const TranscriptTabs = ({
  transcript,
  summaryMap,
  activeTab,
  setActiveTab,
  summaryRefs,
  handleCopy,
  handleMaximize,
  features
}: TranscriptTabsProps): JSX.Element => {
  // Switch to consult tab if current tab becomes invisible
  useEffect(() => {
    const isCurrentTabVisible = (
      activeTab === 'consult' ||
      activeTab === 'orders' ||
      (activeTab === 'looper' && features.looper) ||
      (activeTab === 'assist' && features.assistPatient) ||
      (activeTab === 'taskgo' && features.taskGo) ||
      (activeTab === 'hashtask' && features.hashTask)
    );

    if (!isCurrentTabVisible) {
      setActiveTab('consult');
    }
  }, [activeTab, features, setActiveTab]);

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow min-h-0 flex flex-col">
        <div className="px-6 flex justify-between items-center bg-gray-100">
          <TabsList className="h-auto flex flex-wrap gap-2 bg-transparent">
            <TabsTrigger value="consult" className="data-[state=active]:bg-white text-red-500">Consult Wizard</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-white">Orders</TabsTrigger>
            {features.looper && <TabsTrigger value="looper" className="data-[state=active]:bg-white">Looper</TabsTrigger>}
            {features.assistPatient && <TabsTrigger value="assist" className="data-[state=active]:bg-white">Assist Patient</TabsTrigger>}
            {features.taskGo && <TabsTrigger value="taskgo" className="data-[state=active]:bg-white">Task-GO</TabsTrigger>}
            {features.hashTask && <TabsTrigger value="hashtask" className="data-[state=active]:bg-white">#-Task</TabsTrigger>}
          </TabsList>
        </div>

        {/* Dedicated space for Afterscribe */}
        <div className="px-6 py-4 h-[200px] relative">
          {/* Render the FloatingAfterscribe component here */}
          {activeTab === 'consult' && <FloatingAfterscribe />}
        </div>

        <div className="p-6 h-[calc(50vh-var(--tabs-offset))]">
          <TabsContent value="consult" className="h-full m-0">
            <TranscriptConsultWizard
              transcript={transcript}
              summaryMap={summaryMap}
              onCopy={handleCopy}
              onMaximize={handleMaximize}
              summaryRef={summaryRefs['3']}
            />
          </TabsContent>

          <TabsContent value="orders" className="h-full m-0">
            <TranscriptOrders
              transcript={transcript}
              summaryMap={summaryMap}
              onCopy={handleCopy}
              onMaximize={handleMaximize}
              summaryRef={summaryRefs['5']}
            />
          </TabsContent>

          {features.looper && (
            <TabsContent value="looper" className="h-full m-0">
              <TranscriptLooper
                transcript={transcript}
                summaryMap={summaryMap}
                onCopy={handleCopy}
                onMaximize={handleMaximize}
                summaryRef={summaryRefs['2']}
              />
            </TabsContent>
          )}

          {features.assistPatient && (
            <TabsContent value="assist" className="h-full m-0">
              <TranscriptAssistPatient
                transcript={transcript}
                summaryMap={summaryMap}
                onCopy={handleCopy}
                onMaximize={handleMaximize}
                summaryRef={summaryRefs['9']}
              />
            </TabsContent>
          )}

          {features.taskGo && (
            <TabsContent value="taskgo" className="h-full m-0">
              <TranscriptTaskGo
                transcript={transcript}
                summaryMap={summaryMap}
                onCopy={handleCopy}
                onMaximize={handleMaximize}
                summaryRef={summaryRefs['4']}
              />
            </TabsContent>
          )}

          {features.hashTask && (
            <TabsContent value="hashtask" className="h-full m-0">
              <TranscriptHashTask
                transcript={transcript}
                summaryMap={summaryMap}
                onCopy={handleCopy}
                onMaximize={handleMaximize}
                summaryRef={summaryRefs['6']}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default TranscriptTabs;
