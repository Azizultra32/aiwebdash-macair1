import React from 'react';
import styled from 'styled-components';

type TabOption = 'editor' | 'visualizer' | 'flow' | 'tester';

interface Props {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

const TabButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? 'hsl(var(--ring))' : 'hsl(var(--muted))')};
  color: ${(props) => (props.active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))')};
  &:hover {
    background-color: ${(props) => (props.active ? 'hsl(var(--ring) / 0.8)' : 'hsl(var(--muted-foreground))')};
  }
`;

const PromptTabs = ({ activeTab, onTabChange }: Props) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <TabButton active={activeTab === 'editor'} onClick={() => onTabChange('editor')}>
        Editor
      </TabButton>
      <TabButton active={activeTab === 'visualizer'} onClick={() => onTabChange('visualizer')}>
        Visualizer
      </TabButton>
      <TabButton active={activeTab === 'flow'} onClick={() => onTabChange('flow')}>
        Flow
      </TabButton>
      <TabButton active={activeTab === 'tester'} onClick={() => onTabChange('tester')}>
        Tester
      </TabButton>
    </div>
  );
};

export default PromptTabs;