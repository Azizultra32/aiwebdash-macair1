import React from 'react'
import DraggableContainer from './DraggableContainer'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { cn } from '@/lib/utils'

interface SummaryPanelProps {
  title: string
  children: React.ReactNode
  className?: string
  /** Enable dragging. Defaults to true */
  draggable?: boolean
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  title,
  children,
  className,
  draggable = true,
}) => {
  const content = (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
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
