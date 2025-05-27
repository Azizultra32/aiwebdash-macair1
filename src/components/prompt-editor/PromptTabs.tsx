import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabOption = 'editor' | 'visualizer' | 'flow' | 'tester';

interface Props {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

const PromptTabs = ({ activeTab, onTabChange }: Props) => (
  <Tabs value={activeTab} onValueChange={onTabChange} className="mb-5">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="editor">Editor</TabsTrigger>
      <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
      <TabsTrigger value="flow">Flow</TabsTrigger>
      <TabsTrigger value="tester">Tester</TabsTrigger>
    </TabsList>
  </Tabs>
);

export default PromptTabs;