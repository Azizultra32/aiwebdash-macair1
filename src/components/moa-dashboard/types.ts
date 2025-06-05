export type Person = {
  id: string
  name: string
  role: string
  type: 'DOCTOR' | 'MOA'
  specialization?: string
  availability?: 'Available' | 'Busy'
  image: string
}

export type Patient = {
  id: string
  name: string
}

export type Task = {
  id: string
  name: string
  doctorId: string
  patientId: string
  date: string
  tag: string
  assignee: Person | null
  status: 'pending' | 'completed'
  notes?: string
}

export type DoctorMOAAssignment = {
  doctorId: string
  moaId: string
}

export type Group = {
  id: string
  name: string
  doctorIds: string[]
}
