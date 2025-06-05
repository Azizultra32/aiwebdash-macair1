import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Group, Person } from './types'
import CreateGroupDialog from './dialogs/CreateGroupDialog'
import GroupCard from './dialogs/GroupCard'

type Props = {
  groups: Group[]
  doctors: Person[]
  onCreateGroup: (name: string, doctorIds: string[]) => void
  onRemoveDoctor: (groupId: string, doctorId: string) => void
  onDeleteGroup: (groupId: string) => void
}

const GroupManagement: React.FC<Props> = ({ groups, doctors, onCreateGroup, onRemoveDoctor, onDeleteGroup }) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle>Assign MOAs to Doctors</CardTitle>
      <CreateGroupDialog doctors={doctors} onCreateGroup={onCreateGroup} />
    </CardHeader>
    <CardContent className="p-0">
      <ScrollArea className="h-[calc(100vh-16rem)] px-4 py-2">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            doctors={doctors}
            onRemoveDoctor={(doctorId) => onRemoveDoctor(group.id, doctorId)}
            onDeleteGroup={() => onDeleteGroup(group.id)}
          />
        ))}
      </ScrollArea>
    </CardContent>
  </Card>
)

export default GroupManagement
