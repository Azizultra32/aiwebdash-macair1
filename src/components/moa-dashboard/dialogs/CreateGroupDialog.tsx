import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Person } from '../types'

type Props = {
  doctors: Person[]
  onCreateGroup: (name: string, doctorIds: string[]) => void
}

const CreateGroupDialog: React.FC<Props> = ({ doctors, onCreateGroup }) => {
  const [groupName, setGroupName] = React.useState('')
  const [selectedDoctors, setSelectedDoctors] = React.useState<string[]>([])

  const handleCreate = () => {
    if (groupName && selectedDoctors.length > 0) {
      onCreateGroup(groupName, selectedDoctors)
      setGroupName('')
      setSelectedDoctors([])
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <span className="mr-2">+</span>
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div>
            <Label>Select Doctors</Label>
            {doctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`doctor-${doctor.id}`}
                  checked={selectedDoctors.includes(doctor.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDoctors([...selectedDoctors, doctor.id])
                    } else {
                      setSelectedDoctors(selectedDoctors.filter((id) => id !== doctor.id))
                    }
                  }}
                />
                <Label htmlFor={`doctor-${doctor.id}`}>{doctor.name}</Label>
              </div>
            ))}
          </div>
          <Button onClick={handleCreate}>Create Group</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupDialog
