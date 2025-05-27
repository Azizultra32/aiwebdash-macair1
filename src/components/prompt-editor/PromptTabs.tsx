/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabOption = 'editor' | 'visualizer' | 'flow' | 'tester';

interface Props {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

const PromptTabs = ({ activeTab, onTabChange }: Props) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-5">
      <TabsList>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
        <TabsTrigger value="flow">Flow</TabsTrigger>
        <TabsTrigger value="tester">Tester</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default PromptTabs;
