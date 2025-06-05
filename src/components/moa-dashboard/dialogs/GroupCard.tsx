import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Group, Person } from '../types'

interface Props {
  group: Group
  doctors: Person[]
  onRemoveDoctor: (doctorId: string) => void
  onDeleteGroup: () => void
}

const GroupCard: React.FC<Props> = ({ group, doctors, onRemoveDoctor, onDeleteGroup }) => (
  <Card className="mb-4">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{group.name}</CardTitle>
      <Button variant="destructive" size="sm" onClick={onDeleteGroup}>
        Delete Group
      </Button>
    </CardHeader>
    <CardContent>
      {group.doctorIds.map((doctorId) => {
        const doctor = doctors.find((d) => d.id === doctorId)
        if (!doctor) return null
        return (
          <div key={doctorId} className="flex items-center justify-between mb-2">
            <span>{doctor.name}</span>
            <Button variant="ghost" size="sm" onClick={() => onRemoveDoctor(doctorId)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Remove {doctor.name} from group</span>
            </Button>
          </div>
        )
      })}
    </CardContent>
  </Card>
)

export default GroupCard
