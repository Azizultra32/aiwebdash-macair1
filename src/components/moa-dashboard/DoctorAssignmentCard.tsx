import React from 'react'
import { useDrop } from 'react-dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Person } from './types'

interface Props {
  doctor: Person
  assignedMOAs: Person[]
  onAssign: (moaId: string) => void
  onUnassign: (moaId: string) => void
}

const DoctorAssignmentCard: React.FC<Props> = ({ doctor, assignedMOAs, onAssign, onUnassign }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'PERSON',
    drop: (item: Person) => {
      if (item.type === 'MOA') {
        onAssign(item.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div ref={drop} className={`mb-4 ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{doctor.name}</h3>
            <Badge variant="secondary">{doctor.specialization}</Badge>
          </div>
          <div className="space-y-2">
            {assignedMOAs.map((moa) => (
              <div key={moa.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                <span>{moa.name}</span>
                <Button variant="ghost" size="sm" onClick={() => onUnassign(moa.id)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove {moa.name}</span>
                </Button>
              </div>
            ))}
            {assignedMOAs.length < 3 && (
              <div className="h-10 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-sm text-gray-500">
                Drop MOA here
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorAssignmentCard
