import { ReactNode, useState } from 'react';
import styled from '@emotion/styled';

const TabContainer = styled.div`
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => (props.active ? '#0070f3' : '#f4f4f4')};
  color: ${props => (props.active ? 'white' : 'black')};
  &:hover {
    background-color: ${props => (props.active ? '#0051a2' : '#e4e4e4')};
  }
`;

interface PromptTabsProps {
  flowTabLabel?: string;
  manageTabLabel?: string;
  flowComponent: ReactNode;
  manageComponent: ReactNode;
}

const PromptTabs = ({
  flowTabLabel = 'Workflow Diagram',
  manageTabLabel = 'Manage Prompts',
  flowComponent,
  manageComponent
}: PromptTabsProps) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'manage'>('flow');

  return (
    <>
      <TabContainer>
        <Tab active={activeTab === 'flow'} onClick={() => setActiveTab('flow')}>
          {flowTabLabel}
        </Tab>
        <Tab active={activeTab === 'manage'} onClick={() => setActiveTab('manage')}>
          {manageTabLabel}
        </Tab>
      </TabContainer>
      {activeTab === 'flow' ? flowComponent : manageComponent}
    </>
  );
};

export default PromptTabs;
