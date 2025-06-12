import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SummaryPanel from '@/components/SummaryPanel';
import type { SummaryRef } from '@/types/types';

describe('SummaryPanel', () => {
  it('invokes onPrint when print button is clicked', () => {
    const onPrint = vi.fn();
    const onCopy = vi.fn();
    const onMaximize = vi.fn();
    const ref = React.createRef<SummaryRef>();
    render(
      <SummaryPanel
        title="Test"
        onCopy={onCopy}
        onMaximize={onMaximize}
        onPrint={onPrint}
        summaryRef={ref}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Print summary' }));
    expect(onPrint).toHaveBeenCalled();
  });
});
