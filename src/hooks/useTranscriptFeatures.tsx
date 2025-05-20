import { useState, useCallback } from 'react';

interface TranscriptFeatures {
  looper: boolean;
  assistPatient: boolean;
  taskGo: boolean;
  hashTask: boolean;
}

export const useTranscriptFeatures = () => {
  const [features, setFeatures] = useState<TranscriptFeatures>({
    looper: true,
    assistPatient: true,
    taskGo: true,
    hashTask: true,
  });

  const toggleFeature = useCallback((feature: keyof TranscriptFeatures) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  }, []);

  return { features, toggleFeature };
};
