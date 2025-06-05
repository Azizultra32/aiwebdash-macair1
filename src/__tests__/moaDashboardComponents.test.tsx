import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { GroupManagement, TaskList, DoctorAssignmentCard, type Person, type Group, type Task, type Patient } from '@/components/moa-dashboard'

const doctor: Person = { id: 'd1', name: 'Dr. Who', role: 'Physician', type: 'DOCTOR', image: '' }
const moa: Person = { id: 'm1', name: 'Jane', role: 'MOA', type: 'MOA', image: '' }
const patient: Patient = { id: 'p1', name: 'Pat' }
const task: Task = { id: 't1', name: 'Checkup', doctorId: doctor.id, patientId: patient.id, date: 'today', tag: 'General', assignee: null, status: 'pending' }

describe('MOA dashboard components', () => {
  it('creates a group via dialog', () => {
    const onCreate = vi.fn()
    render(
      <GroupManagement
        groups={[]}
        doctors={[doctor]}
        onCreateGroup={onCreate}
        onRemoveDoctor={vi.fn()}
        onDeleteGroup={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Create Group'))
    fireEvent.change(screen.getByLabelText('Group Name'), { target: { value: 'Team' } })
    fireEvent.click(screen.getByLabelText(doctor.name))
    fireEvent.click(screen.getByRole('button', { name: 'Create Group' }))
    expect(onCreate).toHaveBeenCalledWith('Team', [doctor.id])
  })

  it('filters tasks on search', () => {
    const onSearch = vi.fn()
    render(
      <DndProvider backend={HTML5Backend}>
        <TaskList
          tasks={[task]}
          doctors={[doctor]}
          patients={[patient]}
          taskSearch=""
          onSearch={onSearch}
          onComplete={vi.fn()}
          onAssign={vi.fn()}
        />
      </DndProvider>
    )
    fireEvent.change(screen.getByPlaceholderText('Search tasks...'), { target: { value: 'abc' } })
    expect(onSearch).toHaveBeenCalledWith('abc')
    expect(screen.getByText('Checkup')).toBeTruthy()
  })

  it('unassigns an MOA', () => {
    const onUnassign = vi.fn()
    render(
      <DndProvider backend={HTML5Backend}>
        <DoctorAssignmentCard
          doctor={doctor}
          assignedMOAs={[moa]}
          onAssign={vi.fn()}
          onUnassign={onUnassign}
        />
      </DndProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onUnassign).toHaveBeenCalledWith(moa.id)
  })
})
