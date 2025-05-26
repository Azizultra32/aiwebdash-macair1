import type { Meta, StoryObj } from '@storybook/react';
import TranscriptSummary from './TranscriptSummary';
import type { Transcript } from '@/types/types';

const meta: Meta<typeof TranscriptSummary> = {
  title: 'Components/TranscriptSummary',
  component: TranscriptSummary,
};
export default meta;

type Story = StoryObj<typeof TranscriptSummary>;

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
  args: {
    summary: { links: [], title: 'Summary', number: 1, summary: 'Sample summary text.' },
    transcript,
  },
};
