import React from 'react'
import { useDrop } from 'react-dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Task, Person, Patient } from './types'

interface Props {
  task: Task
  doctor: Person
  patient: Patient
  onComplete: () => void
  onAssign: (person: Person) => void
}

const TaskCard: React.FC<Props> = ({ task, doctor, patient, onComplete, onAssign }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'PERSON',
    drop: (item: Person) => onAssign(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const [showNotes, setShowNotes] = React.useState(false)

  return (
    <div
      ref={drop}
      className={`mb-4 ${isOver ? 'ring-2 ring-primary' : ''} ${
        task.status === 'completed' ? 'opacity-50' : ''
      }`}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between">
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-medium">{task.name}</h3>
              <p className="text-sm mt-1">
                <span className="font-bold">{patient.name}</span> - {task.date}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{doctor.name}</p>
            </div>
            <div className="flex flex-col items-end ml-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onComplete}
                disabled={task.status === 'completed' || !task.assignee}
              >
                {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
              </Button>
              <p className="text-sm text-muted-foreground">
                {task.assignee ? task.assignee.name : 'Unassigned'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Badge variant="secondary">{task.tag}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
            >
              {showNotes ? 'Hide Notes' : 'Show Notes'}
            </Button>
          </div>
          {showNotes && (
            <div className="mt-2 relative">
              <textarea
                className="w-full h-40 p-2 text-sm border rounded-md resize-none"
                placeholder="Enter notes here..."
                defaultValue={task.notes || ''}
              />
              <Button variant="secondary" size="sm" className="absolute bottom-2 right-2">
                Save Notes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TaskCard
