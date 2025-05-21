import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Transcript } from '@/types/types';

interface GlobalState {
  clientTranscripts: Transcript[] | undefined;
  transcriptCount: number;
}

interface GlobalStateContextProps {
  state: GlobalState;
  setClientTranscriptsData: (transcripts: Transcript[] | undefined) => void;
  updateTranscriptCount: (count: number) => void;
}

const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(
  undefined
);

export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<GlobalState>({
    clientTranscripts: [],
    transcriptCount: 0,
  });

  const setClientTranscriptsData = (transcripts: Transcript[] | undefined) => {
    setState((prevState) => ({ ...prevState, clientTranscripts: transcripts }));
  };

  const updateTranscriptCount = (count: number) => {
    setState(prev => ({
      ...prev,
      transcriptCount: count
    }));
  };

  return (
    <GlobalStateContext.Provider value={{ state, setClientTranscriptsData, updateTranscriptCount }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
