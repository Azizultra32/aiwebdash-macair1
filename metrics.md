# Build and Performance Metrics

This file records build output and render performance numbers for reference. Results are appended chronologically.

## 2025-05-20

### Build Output

`npm run build` failed due to missing dependencies in this environment. The tail of the output is shown below:

```
src/views/MoaDashboard.tsx(435,5): error TS2875: This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found. Make sure you have types for the appropriate package installed.
src/views/MoaDashboard.tsx(460,31): error TS2322: Type '{ key: any; person: any; }' is not assignable to type '{ person: Person; }'.
  Property 'key' does not exist on type '{ person: Person; }'.
src/views/MoaDashboard.tsx(491,25): error TS2322: Type '{ key: any; group: any; doctors: any; onRemoveDoctor: (doctorId: string) => void; onDeleteGroup: () => void; }' is not assignable to type '{ group: Group; doctors: Person[]; onRemoveDoctor: (doctorId: string) => void; onDeleteGroup: () => void; }'.
  Property 'key' does not exist on type '{ group: Group; doctors: Person[]; onRemoveDoctor: (doctorId: string) => void; onDeleteGroup: () => void; }'.
src/views/MoaDashboard.tsx(500,25): error TS2322: Type '{ key: any; doctor: any; assignedMOAs: any; onAssign: (moaId: string) => void; onUnassign: (moaId: string) => void; }' is not assignable to type '{ doctor: Person; assignedMOAs: Person[]; onAssign: (moaId: string) => void; onUnassign: (moaId: string) => void; }'.
  Property 'key' does not exist on type '{ doctor: Person; assignedMOAs: Person[]; onAssign: (moaId: string) => void; onUnassign: (moaId: string) => void; }'.
src/views/MoaDashboard.tsx(539,29): error TS2322: Type '{ key: any; task: any; doctor: any; patient: any; onComplete: () => void; onAssign: (person: Person) => void; }' is not assignable to type '{ task: Task; doctor: Person; patient: Patient; onComplete: () => void; onAssign: (person: Person) => void; }'.
  Property 'key' does not exist on type '{ task: Task; doctor: Person; patient: Patient; onComplete: () => void; onAssign: (person: Person) => void; }'.
src/views/MoaDashboard.tsx(554,33): error TS2322: Type '{ key: any; task: any; doctor: any; patient: any; onComplete: () => void; onAssign: (person: Person) => void; }' is not assignable to type '{ task: Task; doctor: Person; patient: Patient; onComplete: () => void; onAssign: (person: Person) => void; }'.
  Property 'key' does not exist on type '{ task: Task; doctor: Person; patient: Patient; onComplete: () => void; onAssign: (person: Person) => void; }'.
src/views/MoaDashboard.tsx(586,33): error TS2322: Type '{ key: any; person: any; }' is not assignable to type '{ person: Person; }'.
  Property 'key' does not exist on type '{ person: Person; }'.
src/views/PromptEditor.tsx(1,26): error TS2307: Cannot find module 'react' or its corresponding type declarations.
src/views/PromptEditor.tsx(2,20): error TS2307: Cannot find module '@emotion/styled' or its corresponding type declarations.
src/views/PromptEditor.tsx(31,5): error TS2875: This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found. Make sure you have types for the appropriate package installed.
src/views/Register.tsx(1,22): error TS2307: Cannot find module 'react-router-dom' or its corresponding type declarations.
src/views/Register.tsx(6,5): error TS2875: This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found. Make sure you have types for the appropriate package installed.
src/views/Reset.tsx(1,22): error TS2307: Cannot find module 'react-router-dom' or its corresponding type declarations.
src/views/Reset.tsx(7,5): error TS2875: This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found. Make sure you have types for the appropriate package installed.
```

### Render Performance

Render timing numbers could not be collected because the project dependencies were missing.

## 2025-05-20 (Attempt 2)

Build failed because project dependencies were not installed. Network access was unavailable, so `npm ci` and `npm run build` failed.

