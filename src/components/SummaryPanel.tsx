import React from 'react'
import DraggableContainer from './DraggableContainer'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Copy, Maximize2, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SummaryRef } from '@/types/types'

interface SummaryPanelProps {
  title: string
  children: React.ReactNode
  className?: string
  /** Enable dragging. Defaults to true */
  draggable?: boolean
  onCopy?: (ref: React.RefObject<SummaryRef>) => void
  onMaximize?: (ref: React.RefObject<SummaryRef>) => void
  onPrint?: () => void
  summaryRef?: React.RefObject<SummaryRef>
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  title,
  children,
  className,
  draggable = true,
  onCopy,
  onMaximize,
  onPrint,
  summaryRef,
}) => {
  const actions =
    (onCopy || onMaximize || onPrint) && (
      <div className="flex items-center gap-2">
        {onCopy && summaryRef && (
          <Button variant="ghost" size="sm" onClick={() => onCopy(summaryRef)}>
            <Copy className="h-5 w-5" />
            <span className="sr-only">Copy summary</span>
          </Button>
        )}
        {onMaximize && summaryRef && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMaximize(summaryRef)}
          >
            <Maximize2 className="h-5 w-5" />
            <span className="sr-only">Maximize summary</span>
          </Button>
        )}
        {onPrint && (
          <Button variant="ghost" size="sm" onClick={onPrint}>
            <Printer className="h-5 w-5" />
            <span className="sr-only">Print summary</span>
          </Button>
        )}
      </div>
    )

  const content = (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="flex-grow min-h-0 pt-2 px-4 pb-4">
        {children}
      </CardContent>
    </Card>
  )

  if (draggable) {
    return <DraggableContainer className={cn(className)}>{content}</DraggableContainer>
  }

  return <div className={cn(className)}>{content}</div>
}

export default SummaryPanel
