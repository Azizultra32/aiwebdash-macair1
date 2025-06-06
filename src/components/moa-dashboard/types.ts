export interface Person {
  id: string
  name: string
  role: string
  type: 'DOCTOR' | 'MOA'
  specialization?: string
  availability?: 'Available' | 'Busy'
  image: string
}

export interface Patient {
  id: string
  name: string
}

export interface Task {
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

export interface DoctorMOAAssignment {
  doctorId: string
  moaId: string
}

export interface Group {
  id: string
  name: string
  doctorIds: string[]
}
