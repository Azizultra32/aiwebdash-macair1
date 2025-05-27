"use client"

import * as React from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useNavigate } from 'react-router-dom'
import DraggableContainer from '@/components/DraggableContainer'

// Types
type Person = {
  id: string
  name: string
  role: string
  type: "DOCTOR" | "MOA"
  specialization?: string
  availability?: "Available" | "Busy"
  image: string
}

type Patient = {
  id: string
  name: string
}

type Task = {
  id: string
  name: string
  doctorId: string
  patientId: string
  date: string
  tag: string
  assignee: Person | null
  status: "pending" | "completed"
  notes?: string
}

type DoctorMOAAssignment = {
  doctorId: string
  moaId: string
}

type Group = {
  id: string
  name: string
  doctorIds: string[]
}

// Initial Data
const initialDoctors: Person[] = [
  { id: "d1", name: "Dr. Smith", role: "Physician", type: "DOCTOR", specialization: "Cardiology", image: "/placeholder.svg" },
  { id: "d2", name: "Dr. Johnson", role: "Physician", type: "DOCTOR", specialization: "Orthopedics", image: "/placeholder.svg" },
  { id: "d3", name: "Dr. Williams", role: "Physician", type: "DOCTOR", specialization: "Cardiology", image: "/placeholder.svg" },
]

const initialMOAs: Person[] = [
  { id: "m1", name: "Jane Doe", role: "Medical Office Assistant", type: "MOA", availability: "Available", image: "/placeholder.svg" },
  { id: "m2", name: "John Smith", role: "Medical Office Assistant", type: "MOA", availability: "Busy", image: "/placeholder.svg" },
  { id: "m3", name: "Sarah Johnson", role: "Medical Office Assistant", type: "MOA", availability: "Available", image: "/placeholder.svg" },
]

const initialPatients: Patient[] = [
  { id: "p1", name: "Alice Brown" },
  { id: "p2", name: "Bob Green" },
  { id: "p3", name: "Charlie White" },
]

const initialTasks: Task[] = [
  { id: "t1", name: "Complete SOAP Notes", doctorId: "d1", patientId: "p1", date: "2023-06-15", tag: "Documentation", assignee: null, status: "pending", notes: "Patient reported improvement in symptoms." },
  { id: "t2", name: "Review Lab Results", doctorId: "d2", patientId: "p2", date: "2023-06-16", tag: "Lab", assignee: null, status: "pending" },
  { id: "t3", name: "Patient Follow-up", doctorId: "d3", patientId: "p3", date: "2023-06-17", tag: "Follow-up", assignee: null, status: "pending" },
  { id: "t4", name: "Prescription Renewal", doctorId: "d1", patientId: "p2", date: "2023-06-18", tag: "Prescription", assignee: null, status: "pending" },
]

// Draggable Person Card Component
const PersonCard = ({ person }: { person: Person }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PERSON",
    item: person,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`cursor-move ${isDragging ? "opacity-50" : ""}`}
    >
      <Card className="mb-2 hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar>
            <AvatarImage src={person.image} alt={person.name} />
            <AvatarFallback>{person.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{person.name}</p>
            <p className="text-sm text-muted-foreground">{person.role}</p>
            {person.type === "DOCTOR" && (
              <p className="text-xs text-muted-foreground">{person.specialization}</p>
            )}
            {person.type === "MOA" && (
              <p className="text-xs text-muted-foreground">{person.availability}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Task Card Component
const TaskCard = ({ task, doctor, patient, onComplete, onAssign }: { task: Task; doctor: Person; patient: Patient; onComplete: () => void; onAssign: (person: Person) => void }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "PERSON",
    drop: (item: Person) => onAssign(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const [showNotes, setShowNotes] = React.useState(false)

  return (
    <div
      ref={drop}
      className={`mb-4 ${isOver ? "ring-2 ring-primary" : ""} ${
        task.status === "completed" ? "opacity-50" : ""
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
                disabled={task.status === "completed" || !task.assignee}
              >
                {task.status === "completed" ? "Completed" : "Mark Complete"}
              </Button>
              <p className="text-sm text-muted-foreground">
                {task.assignee ? task.assignee.name : "Unassigned"}
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
              {showNotes ? "Hide Notes" : "Show Notes"}
            </Button>
          </div>
          {showNotes && (
            <div className="mt-2 relative">
              <textarea
                className="w-full h-40 p-2 text-sm border rounded-md resize-none"
                placeholder="Enter notes here..."
                defaultValue={task.notes || ""}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
              >
                Save Notes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// MOA Assignment Card Component
const MOAAssignmentCard = ({ doctor, assignedMOAs, onAssign, onUnassign }: { doctor: Person; assignedMOAs: Person[]; onAssign: (moaId: string) => void; onUnassign: (moaId: string) => void }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "PERSON",
    drop: (item: Person) => {
      if (item.type === "MOA") {
        onAssign(item.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`mb-4 ${isOver ? "ring-2 ring-primary" : ""}`}
    >
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

// Group Card Component
const GroupCard = ({ group, doctors, onRemoveDoctor, onDeleteGroup }: { group: Group; doctors: Person[]; onRemoveDoctor: (doctorId: string) => void; onDeleteGroup: () => void }) => {
  return (
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
}

// Create Group Dialog Component
const CreateGroupDialog = ({ doctors, onCreateGroup }: { doctors: Person[]; onCreateGroup: (name: string, doctorIds: string[]) => void }) => {
  const [groupName, setGroupName] = React.useState("")
  const [selectedDoctors, setSelectedDoctors] = React.useState<string[]>([])

  const handleCreateGroup = () => {
    if (groupName && selectedDoctors.length > 0) {
      onCreateGroup(groupName, selectedDoctors)
      setGroupName("")
      setSelectedDoctors([])
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
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
          <Button onClick={handleCreateGroup}>Create Group</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const [doctors, setDoctors] = React.useState<Person[]>(initialDoctors)
  const [moas, setMOAs] = React.useState<Person[]>(initialMOAs)
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks)
  const [patients] = React.useState<Patient[]>(initialPatients)
  const [doctorSearch, setDoctorSearch] = React.useState("")
  const [moaSearch, setMOASearch] = React.useState("")
  const [taskSearch, setTaskSearch] = React.useState("")
  const [isDoctorsVisible, setIsDoctorsVisible] = React.useState(false)
  const [doctorMOAAssignments, setDoctorMOAAssignments] = React.useState<DoctorMOAAssignment[]>([])
  const [groups, setGroups] = React.useState<Group[]>([])

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(doctorSearch.toLowerCase()))

  const filteredMOAs = moas.filter((moa) =>
    moa.name.toLowerCase().includes(moaSearch.toLowerCase())
  )

  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(taskSearch.toLowerCase())
  )

  const handleTaskAssignment = (taskId: string, person: Person) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, assignee: person } : task
      )
    )
  }

  const handleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    )
  }

  const handleReset = () => {
    setTasks(tasks.map((task) => ({ ...task, assignee: null, status: "pending" })))
    setDoctorMOAAssignments([])
    setGroups([])
  }

  const getSummary = () => {
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const assignedTasks = tasks.filter((task) => task.assignee !== null).length
    return `Completed: ${completedTasks} | Assigned: ${assignedTasks}`
  }

  const toggleDoctorsVisibility = () => {
    setIsDoctorsVisible(!isDoctorsVisible)
  }

  const handleAssignMOAToDoctor = (doctorId: string, moaId: string) => {
    setDoctorMOAAssignments((prev) => [...prev, { doctorId, moaId }])
  }

  const handleUnassignMOAFromDoctor = (doctorId: string, moaId: string) => {
    setDoctorMOAAssignments((prev) => 
      prev.filter((assignment) => !(assignment.doctorId === doctorId && assignment.moaId === moaId))
    )
  }

  const getAssignedMOAsForDoctor = (doctorId: string) => {
    const assignedMOAIds = doctorMOAAssignments
      .filter((assignment) => assignment.doctorId === doctorId)
      .map((assignment) => assignment.moaId)
    return moas.filter((moa) => assignedMOAIds.includes(moa.id))
  }

  const handleCreateGroup = (name: string, doctorIds: string[]) => {
    const newGroup: Group = {
      id: `group-${groups.length + 1}`,
      name,
      doctorIds,
    }
    setGroups([...groups, newGroup])
  }

  const handleRemoveDoctorFromGroup = (groupId: string, doctorId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId
        ? { ...group, doctorIds: group.doctorIds.filter(id => id !== doctorId) }
        : group
    ))
  }

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId))
  }

  const navigate = useNavigate();
  const handleDashboard = () => {
    navigate('/', { replace: true });
  };


  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-100">
        {/* Left sidebar (Doctors) */}
        <div className={`bg-white transition-all duration-300 ease-in-out ${isDoctorsVisible ? 'w-80' : 'w-12'} flex flex-col`}>
          <div className="p-4 flex justify-between items-center">
            <h2 className={`font-semibold ${isDoctorsVisible ? '' : 'hidden'}`}>Doctors</h2>
            <Button variant="ghost" size="icon" onClick={toggleDoctorsVisibility}>
              {isDoctorsVisible ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isDoctorsVisible ? 'Hide doctors' : 'Show doctors'}
              </span>
            </Button>
          </div>
          {isDoctorsVisible && (
            <>
              <div className="px-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1 px-4">
                {filteredDoctors.map((doctor) => (
                  <PersonCard key={doctor.id} person={doctor} />
                ))}
              </ScrollArea>
            </>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-16 bg-white border-b flex items-center justify-between px-4">
            <h1 className="text-2xl font-bold">Task Management Dashboard</h1>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleReset}>
                Reset All
              </Button>
              <Button variant="secondary">{getSummary()}</Button>
              <Button variant="secondary" onClick={handleDashboard}>Dashboard</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 h-[calc(100vh-4rem)] overflow-hidden">
            {isDoctorsVisible ? (
              // MOA Assignment Column
              <DraggableContainer className="col-span-1">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Assign MOAs to Doctors</CardTitle>
                  <CreateGroupDialog doctors={doctors} onCreateGroup={handleCreateGroup} />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-16rem)] px-4 py-2">
                    {groups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        doctors={doctors}
                        onRemoveDoctor={(doctorId) => handleRemoveDoctorFromGroup(group.id, doctorId)}
                        onDeleteGroup={() => handleDeleteGroup(group.id)}
                      />
                    ))}
                    {doctors.map((doctor) => (
                      <MOAAssignmentCard
                        key={doctor.id}
                        doctor={doctor}
                        assignedMOAs={getAssignedMOAsForDoctor(doctor.id)}
                        onAssign={(moaId) => handleAssignMOAToDoctor(doctor.id, moaId)}
                        onUnassign={(moaId) => handleUnassignMOAFromDoctor(doctor.id, moaId)}
                      />
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
              </DraggableContainer>
            ) : (
              // Tasks Panel (visible when doctors column is collapsed)
              <DraggableContainer className="col-span-1">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
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
                        {filteredTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            doctor={doctors.find((d) => d.id === task.doctorId)!}
                            patient={patients.find((p) => p.id === task.patientId)!}
                            onComplete={() => handleTaskCompletion(task.id)}
                            onAssign={(person) => handleTaskAssignment(task.id, person)}
                          />
                        ))}
                      </TabsContent>
                      {doctors.map((doctor) => (
                        <TabsContent key={doctor.id} value={doctor.id} className="mt-0">
                          {filteredTasks
                            .filter((task) => task.doctorId === doctor.id)
                            .map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                doctor={doctor}
                                patient={patients.find((p) => p.id === task.patientId)!}
                                onComplete={() => handleTaskCompletion(task.id)}
                                onAssign={(person) => handleTaskAssignment(task.id, person)}
                              />
                            ))}
                        </TabsContent>
                      ))}
                    </ScrollArea>
                  </Tabs>
                </CardContent>
              </Card>
              </DraggableContainer>
            )}
            {/* MOAs Panel */}
            <DraggableContainer className="col-span-1">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>MOAs</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search MOAs..."
                    value={moaSearch}
                    onChange={(e) => setMOASearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-16rem)] px-4 py-2">
                  {filteredMOAs.map((moa) => (
                    <PersonCard key={moa.id} person={moa} />
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
            </DraggableContainer>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

