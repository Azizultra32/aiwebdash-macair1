import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalState {
  clientTranscripts: TranscriptT[] | undefined;
  transcriptCount: number;
}

interface GlobalStateContextProps {
  state: GlobalState;
  setClientTranscriptsData: (transcripts: TranscriptT[] | undefined) => void;
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
    transcriptCount: 0
  });

  const setClientTranscriptsData = (transcripts: TranscriptT[] | undefined) => {
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

type Summary = {
  summary: string;
};

type AISummaryArgument = {
  number: number;
  summary: string;
};

type AISummaryStructure = {
  arguments?: {
    summaries?: AISummaryArgument[];
  };
};

export interface TranscriptT {
  // Base fields
  id: number;
  user_id: string;
  created_at: string;
  summary?: Summary;
  token_count: number;
  mid: string;
  completed_at?: string;
  processed_at?: string;
  transcript?: string;
  translation?: string;
  patient_tag: number;
  patient_code: string;
  language?: string;
  error?: string;
  status?: string;

  // AI Summary related fields
  ai_summary?: AISummaryStructure;
  ai_short_summary?: AISummaryStructure;

  // Processing status fields
  queued_completed_at?: string;
  is_paused?: boolean;
}
