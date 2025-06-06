export interface UserData {
  email: string;
}

export interface PasswordData {
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TranscriptData {
  patient_code: string;
  patient_tag: number;
  mid?: string;
  language?: string;
  token_count: number;
}

export interface TranscriptTokenCount {
  mid: string;
  token_count: number;
}

export interface AI_Summary {
  error?: string;
  arguments: {
    summaries: { links: string[]; title: string; number: number; summary: string }[];
  };
}

export type Transcript = {
  id: number;
  user_id: string;
  created_at: string;
  ai_summary?: AI_Summary;
  ai_short_summary?: AI_Summary;
  token_count: number;
  mid: string;
  completed_at?: string;
  processed_at?: string;
  transcript?: string;
  patient_tag: number;
  patient_code: string;
  language?: string;
  error?: string;
  queued_at?: string;
  is_paused?: boolean;
  queued_completed_at?: string;
} & TranscriptData;

export interface ChunkNumberWrapper {
  chunkNumber: number;
}

export interface SummaryRef {
  toggleMaximize: () => void;
  getSummary: () => string;
}
