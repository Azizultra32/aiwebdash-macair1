import type { Meta, StoryObj } from '@storybook/react';
import TranscriptTabs from './TranscriptTabs';
import type { Transcript } from '@/types/types';
import { useState, useRef } from 'react';

const meta: Meta<typeof TranscriptTabs> = {
  title: 'Components/TranscriptTabs',
  component: TranscriptTabs,
};
export default meta;

type Story = StoryObj<typeof TranscriptTabs>;

const transcript: Transcript = {
  id: 1,
  user_id: 'demo',
  created_at: new Date().toISOString(),
  token_count: 0,
  mid: 'mid123',
  patient_tag: 1,
  patient_code: 'ABC',
};

export const Default: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('consult');
    const refs = {
      '3': useRef<HTMLDivElement>(null),
      '5': useRef<HTMLDivElement>(null),
      '2': useRef<HTMLDivElement>(null),
      '9': useRef<HTMLDivElement>(null),
      '4': useRef<HTMLDivElement>(null),
      '6': useRef<HTMLDivElement>(null),
    } as const;

    return (
      <TranscriptTabs
        transcript={transcript}
        summaryMap={{}}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summaryRefs={refs}
        handleCopy={() => {}}
        handleMaximize={() => {}}
        features={{ looper: true, assistPatient: true, taskGo: true, hashTask: true }}
      />
    );
  },
};
