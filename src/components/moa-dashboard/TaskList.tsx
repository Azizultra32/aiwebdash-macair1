import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'
import TaskCard from './TaskCard'
import type { Task, Person, Patient } from './types'

interface Props {
  tasks: Task[]
  doctors: Person[]
  patients: Patient[]
  taskSearch: string
  onSearch: (value: string) => void
  onComplete: (id: string) => void
  onAssign: (id: string, person: Person) => void
}

const TaskList: React.FC<Props> = ({ tasks, doctors, patients, taskSearch, onSearch, onComplete, onAssign }) => (
  <Card className="overflow-hidden">
    <CardHeader>
      <CardTitle>Tasks</CardTitle>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={taskSearch}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <Tabs defaultValue="all" className="h-full flex flex-col">
        <TabsList className="justify-start px-4 py-2 border-b">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          {doctors.map((doctor) => (
            <TabsTrigger key={doctor.id} value={doctor.id}>
              {doctor.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollArea className="flex-1 px-4 py-2">
          <TabsContent value="all" className="mt-0">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                doctor={doctors.find((d) => d.id === task.doctorId)!}
                patient={patients.find((p) => p.id === task.patientId)!}
                onComplete={() => onComplete(task.id)}
                onAssign={(person) => onAssign(task.id, person)}
              />
            ))}
          </TabsContent>
          {doctors.map((doctor) => (
            <TabsContent key={doctor.id} value={doctor.id} className="mt-0">
              {tasks
                .filter((task) => task.doctorId === doctor.id)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    doctor={doctor}
                    patient={patients.find((p) => p.id === task.patientId)!}
                    onComplete={() => onComplete(task.id)}
                    onAssign={(person) => onAssign(task.id, person)}
                  />
                ))}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </CardContent>
  </Card>
)

export default TaskList
