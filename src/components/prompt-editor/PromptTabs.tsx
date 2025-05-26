/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { ReactNode, useState } from 'react';
import styled from '@emotion/styled';

const TabContainer = styled.div`
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? '#0070f3' : '#f4f4f4')};
  color: ${(props) => (props.active ? 'white' : 'black')};
  &:hover {
    background-color: ${(props) => (props.active ? '#0051a2' : '#e4e4e4')};
  }
`;

interface TabItem {
  label: string;
  content: ReactNode;
}

interface PromptTabsProps {
  tabs: TabItem[];
  defaultActive?: number;
}

/**
 * Generic tabbed UI component used by prompt-related views.
 * Renders a set of labeled tabs and displays the active tab's content.
 */
const PromptTabs = ({ tabs, defaultActive = 0 }: PromptTabsProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultActive);

  if (!tabs.length) {
    // Nothing to render if no tabs were provided
    return null;
  }

  // Clamp the active index to a valid range
  const safeIndex = Math.min(Math.max(activeIndex, 0), tabs.length - 1);

  return (
    <>
      <TabContainer>
        {tabs.map((tab, index) => (
          <TabButton
            key={tab.label}
            active={index === safeIndex}
            onClick={() => setActiveIndex(index)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabContainer>
      {tabs[safeIndex].content}
    </>
  );
};

export default PromptTabs;
