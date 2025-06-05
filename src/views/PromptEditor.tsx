/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import styled from '@emotion/styled';
import { useState } from 'react';
import PromptFlow from '@/components/prompt-editor/PromptFlow';
import PromptManager from '@/components/prompt-editor/PromptManager';
import PromptVisualizer from '@/components/prompt-editor/PromptVisualizer';
import PromptTester from '@/components/prompt-editor/PromptTester';
import PromptTabs from '@/components/prompt-editor/PromptTabs';

const Container = styled.div`
  padding: 20px;
`;

function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'visualizer' | 'flow' | 'tester'>('editor');

  return (
    <Container>
      <h1>AI Prompt Workflow Manager</h1>
      <PromptTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'editor' && <PromptManager />}
      {activeTab === 'visualizer' && <PromptVisualizer />}
      {activeTab === 'flow' && <PromptFlow />}
      {activeTab === 'tester' && <PromptTester />}
    </Container>
  );
}

export default App;
