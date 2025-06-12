import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import SummaryPanel from '@/components/SummaryPanel'
import type { SummaryRef } from '@/types/types'

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

  it('remains draggable when onPrint is provided', () => {
    const ref = React.createRef<SummaryRef>()
    const { container } = render(
      <SummaryPanel title="Hello" onPrint={() => {}} summaryRef={ref}>
        content
      </SummaryPanel>
    )
    const root = container.firstChild as HTMLElement
    expect(root.style.cursor).toBe('move')
  })

  it('invokes onPrint when print button is clicked', () => {
    const onPrint = vi.fn()
    const ref = React.createRef<SummaryRef>()
    render(
      <SummaryPanel
        title="Hello"
        onPrint={onPrint}
        summaryRef={ref}
      >
        content
      </SummaryPanel>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Print summary' }))
    expect(onPrint).toHaveBeenCalled()
  })

  it('does not render print button when onPrint is not provided', () => {
    render(<SummaryPanel title="Hello">content</SummaryPanel>)
    expect(
      screen.queryByRole('button', { name: 'Print summary' })
    ).toBeNull()
  })
})
