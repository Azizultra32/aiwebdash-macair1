import React from 'react'
import { useDrag } from 'react-dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Person } from './types'

type Props = {
  person: Person
}

const PersonCard: React.FC<Props> = ({ person }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PERSON',
    item: person,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div ref={drag} className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}>
      <Card className="mb-2 hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar>
            <AvatarImage src={person.image} alt={person.name} />
            <AvatarFallback>{person.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{person.name}</p>
            <p className="text-sm text-muted-foreground">{person.role}</p>
            {person.type === 'DOCTOR' && (
              <p className="text-xs text-muted-foreground">{person.specialization}</p>
            )}
            {person.type === 'MOA' && (
              <p className="text-xs text-muted-foreground">{person.availability}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PersonCard
