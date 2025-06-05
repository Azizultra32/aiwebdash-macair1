"use client"

import * as React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DraggableContainer from '@/components/DraggableContainer'
import {
  PersonCard,
  GroupManagement,
  DoctorAssignmentCard,
  TaskList,
  type Person,
  type Patient,
  type Task,
  type DoctorMOAAssignment,
  type Group,
} from '@/components/moa-dashboard'

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
              <DraggableContainer className="col-span-1">
                <GroupManagement
                  groups={groups}
                  doctors={doctors}
                  onCreateGroup={handleCreateGroup}
                  onRemoveDoctor={handleRemoveDoctorFromGroup}
                  onDeleteGroup={handleDeleteGroup}
                />
                <ScrollArea className="h-[calc(100vh-16rem)] px-4 py-2">
                  {doctors.map((doctor) => (
                    <DoctorAssignmentCard
                      key={doctor.id}
                      doctor={doctor}
                      assignedMOAs={getAssignedMOAsForDoctor(doctor.id)}
                      onAssign={(moaId) => handleAssignMOAToDoctor(doctor.id, moaId)}
                      onUnassign={(moaId) => handleUnassignMOAFromDoctor(doctor.id, moaId)}
                    />
                  ))}
                </ScrollArea>
              </DraggableContainer>
            ) : (
              <DraggableContainer className="col-span-1">
                <TaskList
                  tasks={filteredTasks}
                  doctors={doctors}
                  patients={patients}
                  taskSearch={taskSearch}
                  onSearch={setTaskSearch}
                  onComplete={handleTaskCompletion}
                  onAssign={handleTaskAssignment}
                />
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

