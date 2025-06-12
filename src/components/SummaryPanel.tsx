import React from 'react'
import DraggableContainer from './DraggableContainer'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryPanelProps {
  title: React.ReactNode
  children: React.ReactNode
  /** Triggered when the print button is clicked */
  onPrint?: () => void
  className?: string
  /** Enable dragging. Defaults to true */
  draggable?: boolean
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  title,
  children,
  onPrint,
  className,
  draggable = true,
}) => {
  const content = (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {onPrint && (
            <Button variant="ghost" size="sm" onClick={onPrint}>
              <Printer className="h-5 w-5" />
              <span className="sr-only">Print summary</span>
            </Button>
          )}
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
