import type { Meta, StoryObj } from '@storybook/react';
import Transcript from './Transcript';
import type { Transcript as TranscriptType } from '@/types/types';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

const meta: Meta<typeof Transcript> = {
  title: 'Components/Transcript',
  component: Transcript,
  parameters: {
    viewport: { viewports: INITIAL_VIEWPORTS },
  },
};
export default meta;

type Story = StoryObj<typeof Transcript>;

const transcript: TranscriptType = {
  id: 1,
  user_id: 'demo',
  created_at: new Date().toISOString(),
  token_count: 0,
  mid: 'mid123',
  patient_tag: 1,
  patient_code: 'ABC',
};

const baseProps = {
  transcript,
  recordingPatientMidUUID: undefined,
  uploadingPatientMidUUID: undefined,
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'iphonex' } },
  render: () => <Transcript {...baseProps} />,
};

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'ipad' } },
  render: () => <Transcript {...baseProps} />,
};
