import { logger } from '@/utils/logger';

const BASE_URL = import.meta.env.VITE_V0_API_URL as string | undefined;
const API_KEY = import.meta.env.VITE_V0_API_KEY as string | undefined;

interface V0Response<T> {
  data?: T;
  suggestions?: string[];
  code?: string;
}

async function callV0Api<T>(endpoint: string, payload: unknown): Promise<V0Response<T> | null> {
  if (!BASE_URL || !API_KEY) {
    logger.warn('V0 API credentials are missing');
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      logger.error('V0 API request failed', { status: response.status });
      return null;
    }

    return response.json();
  } catch (error) {
    logger.error('V0 API request threw', error);
    return null;
  }
}

export async function getPromptSuggestions(prompt: string): Promise<string[]> {
  const result = await callV0Api<string[]>('/prompt-suggest', { prompt });
  return result?.suggestions ?? [];
}

export async function generateUIComponent(metadata: {
  title: string;
  promptKey: string;
  promptText: string;
}): Promise<string> {
  const result = await callV0Api<string>('/ui-generate', metadata);
  return result?.code ?? '';
}
