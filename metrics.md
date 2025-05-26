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


## 2025-05-21

### Build Output

`npm run build` failed due to missing dependencies in this environment. The tail of the output is shown below:

```
src/components/TranscriptTabs.tsx(127,17): error TS2322: Type '(ref: RefObject<HTMLDivElement>) => void' is not assignable to type '(ref: RefObject<SummaryRef>) => void'.
  Types of parameters 'ref' and 'ref' are incompatible.
    Type 'RefObject<SummaryRef>' is not assignable to type 'RefObject<HTMLDivElement>'.
      Type 'SummaryRef' is missing the following properties from type 'HTMLDivElement': align, addEventListener, removeEventListener, accessKey, and 304 more.
src/components/TranscriptTabs.tsx(128,17): error TS2322: Type '(ref: RefObject<HTMLDivElement>) => void' is not assignable to type '(ref: RefObject<SummaryRef>) => void'.
  Types of parameters 'ref' and 'ref' are incompatible.
    Type 'RefObject<SummaryRef>' is not assignable to type 'RefObject<HTMLDivElement>'.
      Type 'SummaryRef' is missing the following properties from type 'HTMLDivElement': align, addEventListener, removeEventListener, accessKey, and 304 more.
src/components/TranscriptTabs.tsx(129,17): error TS2322: Type 'RefObject<HTMLDivElement>' is not assignable to type 'RefObject<SummaryRef>'.
  Type 'HTMLDivElement' is missing the following properties from type 'SummaryRef': toggleMaximize, getSummary
src/components/TranscriptTabs.tsx(139,17): error TS2322: Type '(ref: RefObject<HTMLDivElement>) => void' is not assignable to type '(ref: RefObject<SummaryRef>) => void'.
  Types of parameters 'ref' and 'ref' are incompatible.
    Type 'RefObject<SummaryRef>' is not assignable to type 'RefObject<HTMLDivElement>'.
      Type 'SummaryRef' is missing the following properties from type 'HTMLDivElement': align, addEventListener, removeEventListener, accessKey, and 304 more.
src/components/TranscriptTabs.tsx(140,17): error TS2322: Type '(ref: RefObject<HTMLDivElement>) => void' is not assignable to type '(ref: RefObject<SummaryRef>) => void'.
  Types of parameters 'ref' and 'ref' are incompatible.
    Type 'RefObject<SummaryRef>' is not assignable to type 'RefObject<HTMLDivElement>'.
      Type 'SummaryRef' is missing the following properties from type 'HTMLDivElement': align, addEventListener, removeEventListener, accessKey, and 304 more.
src/components/TranscriptTabs.tsx(141,17): error TS2322: Type 'RefObject<HTMLDivElement>' is not assignable to type 'RefObject<SummaryRef>'.
  Type 'HTMLDivElement' is missing the following properties from type 'SummaryRef': toggleMaximize, getSummary
```

### Render Performance

Render timing numbers could not be collected because the project dependencies were missing.


## 2025-05-21 (Attempt 2)

### Build Output

`npm run build` failed due to TypeScript errors. The tail of the output is shown below:

```
src/components/TranscriptTabs.tsx(127,17): error TS2322: Type '(ref: RefObject<HTMLDivElement>) => void' is not assignable to type '(ref: RefObject<SummaryRef>) => void'.
  Types of parameters 'ref' and 'ref' are incompatible.
    Type 'RefObject<SummaryRef>' is not assignable to type 'RefObject<HTMLDivElement>'.
      Type 'SummaryRef' is missing the following properties from type 'HTMLDivElement': align, addEventListener, removeEventListener, accessKey, and 304 more.
src/components/TranscriptTabs.tsx(128,17): error TS2322: Type '(ref: RefObject<HTMLDivElement>) => void' is not assignable to type '(ref: RefObject<SummaryRef>) => void'.
  Types of parameters 'ref' and 'ref' are incompatible.
    Type 'RefObject<SummaryRef>' is not assignable to type 'RefObject<HTMLDivElement>'.
      Type 'SummaryRef' is missing the following properties from type 'HTMLDivElement': align, addEventListener, removeEventListener, accessKey, and 304 more.
src/components/TranscriptTabs.tsx(129,17): error TS2322: Type 'RefObject<HTMLDivElement>' is not assignable to type 'RefObject<SummaryRef>'.
  Type 'HTMLDivElement' is missing the following properties from type 'SummaryRef': toggleMaximize, getSummary
src/components/TranscriptTabs.tsx(139,17): error TS2322: Type '(ref: RefObject<HTMLDivElement>) => void' is not assignable to type '(ref: RefObject<SummaryRef>) => void'.
  Types of parameters 'ref' and 'ref' are incompatible.
    Type 'RefObject<SummaryRef>' is not assignable to type 'RefObject<HTMLDivElement>'.
      Type 'SummaryRef' is missing the following properties from type 'HTMLDivElement': align, addEventListener, removeEventListener, accessKey, and 304 more.
src/components/TranscriptTabs.tsx(140,17): error TS2322: Type '(ref: RefObject<HTMLDivElement>) => void' is not assignable to type '(ref: RefObject<SummaryRef>) => void'.
  Types of parameters 'ref' and 'ref' are incompatible.
    Type 'RefObject<SummaryRef>' is not assignable to type 'RefObject<HTMLDivElement>'.
      Type 'SummaryRef' is missing the following properties from type 'HTMLDivElement': align, addEventListener, removeEventListener, accessKey, and 304 more.
src/components/TranscriptTabs.tsx(141,17): error TS2322: Type 'RefObject<HTMLDivElement>' is not assignable to type 'RefObject<SummaryRef>'.
  Type 'HTMLDivElement' is missing the following properties from type 'SummaryRef': toggleMaximize, getSummary
```

### Test Output

`npm run test` failed. The tail of the output is shown below:

```
 DEV  v1.6.1 /workspace/aiwebdash-macair1

 ✓ src/utils/__tests__/indexedDB.test.ts  (4 tests) 13ms
 ✓ src/__tests__/dashboard-offline.test.tsx  (1 test) 74ms
 ❯ src/utils/__tests__/swMessageHandler.test.ts  (1 test | 1 failed) 225ms
   ❯ src/utils/__tests__/swMessageHandler.test.ts > service worker message handler > posts UPDATE_AVAILABLE when versions differ
     → The parameter 'entries' passed into 'workbox-precaching.PrecacheController.addToCacheList()' must be an array.
 ✓ src/utils/__tests__/debounce.test.ts  (2 tests) 8ms
 ✓ src/utils/__tests__/storageHelpers.test.ts  (2 tests) 5ms

 Test Files  1 failed | 4 passed (5)
      Tests  1 failed | 9 passed (10)
   Start at  06:30:58
   Duration  2.69s (transform 301ms, setup 0ms, collect 482ms, tests 325ms, environment 2.05s, prepare 725ms)


 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
Cancelling test run. Press CTRL+c again to exit forcefully.

```
