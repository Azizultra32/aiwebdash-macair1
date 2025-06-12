import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import SummaryPanel from '@/components/SummaryPanel'

describe('SummaryPanel', () => {
  it('is draggable by default', () => {
    const { container } = render(<SummaryPanel title="Hello">content</SummaryPanel>)
    const root = container.firstChild as HTMLElement
    expect(root.style.cursor).toBe('move')
  })

  it('disables dragging when draggable=false', () => {
    const { container } = render(
      <SummaryPanel title="Hello" draggable={false}>content</SummaryPanel>
    )
    const root = container.firstChild as HTMLElement
    expect(root.style.cursor).not.toBe('move')
  })
})
