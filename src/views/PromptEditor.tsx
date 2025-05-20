import { useState } from 'react';
import styled from '@emotion/styled';
import PromptFlow from '@/components/prompt-editor/PromptFlow';
import PromptManager from '@/components/prompt-editor/PromptManager';

const Container = styled.div`
  padding: 20px;
`;

const TabContainer = styled.div`
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.active ? '#0070f3' : '#f4f4f4'};
  color: ${props => props.active ? 'white' : 'black'};
  &:hover {
    background-color: ${props => props.active ? '#0051a2' : '#e4e4e4'};
  }
`;

function App() {
  const [activeTab, setActiveTab] = useState<'flow' | 'manage'>('flow');

  return (
    <Container>
      <h1>AI Prompt Workflow Manager</h1>
      
      <TabContainer>
        <Tab
          active={activeTab === 'flow'}
          onClick={() => setActiveTab('flow')}
        >
          Workflow Diagram
        </Tab>
        <Tab
          active={activeTab === 'manage'}
          onClick={() => setActiveTab('manage')}
        >
          Manage Prompts
        </Tab>
      </TabContainer>

      {activeTab === 'flow' ? <PromptFlow /> : <PromptManager />}
    </Container>
  );
}

export default App;
