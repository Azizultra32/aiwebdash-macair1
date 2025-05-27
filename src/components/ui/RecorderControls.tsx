import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { ReactMic } from '@/lib/react-mic';
import { useEffect, useState } from 'react';
import { Button } from './button';

export default function RecorderControls({
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
  recordingBlob,
  setRecordingBlob,
  hasApiKey,
  mid,
  microphoneError,
  setMicrophoneError,
}: {
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  recordingBlob: Blob | null;
  setRecordingBlob: React.Dispatch<React.SetStateAction<Blob | null>>;
  hasApiKey: boolean;
  mid: string;
  microphoneError: string;
  setMicrophoneError: React.Dispatch<React.SetStateAction<string>>;
}) {
  const {
    recording,
    recordingPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    hasMicrophoneAccess,
    mimeType,
  } = useAudioRecorder({ mid });

  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    setIsRecording(recording);
  }, [recording, setIsRecording]);

  useEffect(() => {
    setIsPaused(recordingPaused);
  }, [recordingPaused, setIsPaused]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording && !recordingPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording, recordingPaused]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      {(recording || recordingPaused) && (
        <ReactMic
          record={recording && !recordingPaused}
          className="w-full max-w-md"
          onStop={(blob: Blob) => {
            setRecordingBlob(blob);
            setRecordingTime(0);
          }}
          onData={() => {}}
          sampleRate={32000}
          timeSlice={60000}
          mimeType={mimeType}
          strokeColor="hsl(var(--foreground))"
          backgroundColor="hsl(var(--muted))"
        />
      )}
      <div
        className="flex items-center justify-between w-full max-w-md h-[80px] px-5"
      >
        <div className="flex items-center space-x-4">
          {(recording || recordingPaused) && (
            <div className="text-sm text-muted-foreground">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {recording && recordingPaused && (
            <Button
              onClick={resumeRecording}
              disabled={!hasApiKey}
              variant="outline"
              size="sm"
            >
              Resume
            </Button>
          )}
          {recording && !recordingPaused && (
            <Button
              onClick={pauseRecording}
              disabled={!hasApiKey}
              variant="outline"
              size="sm"
            >
              Pause
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={recording || recordingPaused ? stopRecording : startRecording}
                disabled={!hasApiKey}
                className={`w-[60px] h-[60px] rounded-full border-0 bg-transparent flex items-center justify-center ${hasApiKey ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}`}
              >
                {recording && !recordingPaused ? (
                  <svg height="60px" width="100%" viewBox="0 0 64 64" enableBackground="new 0 0 64 64">
                    <path d="M30,2C15.432,2,2,15.432,2,32c0,16.569,13.432,30,30,30s30-13.431,30-30C62,15.432,48.568,2,32,2z M47,47H17V17h30V47z" fill="hsl(var(--destructive))" />
                    <g transform="translate(12.5 16) scale(0.6 0.6)">
                      <path d="M23,45c0,1,0.9,2,2,2h4c1.1,0,2-1.1,2-2V9c0-1-0.9-2-2-2h-4c-1.1,0-2,1.1-2,2V43z" fill="hsl(var(--destructive))" />
                      <path d="M35,45c0,1,0.9,2,2,2h4c1.1,0,2-1.1,2-2V9c0-1-0.9-2-2-2h-4c-1.1,0-2,1.1-2,2V43z" fill="hsl(var(--destructive))" />
                    </g>
                  </svg>
                ) : (
                  <svg height="60px" width="100%">
                    <circle cx="30" cy="30" r="25" stroke="hsl(var(--foreground))" strokeWidth="3" fill={hasMicrophoneAccess ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'} />
                  </svg>
                )}
              </button>
              <button
                onClick={stopRecording}
                className="w-[60px] h-[60px]"
                hidden={!recording && !recordingPaused}
              >
                <svg height="60px" width="100%" viewBox="0 0 64 64" enableBackground="new 0 0 64 64">
                  <path d="M30,2C15.432,2,2,15.432,2,32c0,16.569,13.432,30,30,30s30-13.431,30-30C62,15.432,48.568,2,32,2z M47,47H17V17h30V47z" fill="hsl(var(--destructive))" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {microphoneError && (
        <div className="text-destructive text-sm text-center max-w-md">
          {microphoneError}
        </div>
      )}
      {!hasApiKey && (
        <div className="text-primary text-sm text-center max-w-md">
          Please add your OpenAI API key in settings to start recording.
        </div>
      )}
    </div>
  );
}