import { ReactMic } from '@/lib/react-mic';
import { Switch } from '@/components/ui/switch';
import { MyLiveKitRoom } from '../MyLiveKitRoom';
import { TranscriptData } from '@/types/types';

interface RecorderControlsProps {
  recording: boolean;
  recordingPaused: boolean;
  isRecordButtonDisabled: boolean;
  hasMicrophoneAccess: boolean;
  onStart: () => void;
  onData: (blob: Blob, soundDetected: boolean) => void;
  onStop: (blob: Blob, soundDetected: boolean) => void;
  startRecording: () => void;
  pauseRecording: () => void;
  stopRecording: () => void;
  isAddendum: boolean;
  setIsAddendum: (v: boolean) => void;
  isVoiceChat: boolean;
  setIsVoiceChat: (v: boolean) => void;
  mimeType: string;
  patientData: TranscriptData;
  selectPatient: (patientTag: number) => void;
}

export default function RecorderControls({
  recording,
  recordingPaused,
  isRecordButtonDisabled,
  hasMicrophoneAccess,
  onStart,
  onData,
  onStop,
  startRecording,
  pauseRecording,
  stopRecording,
  isAddendum,
  setIsAddendum,
  isVoiceChat,
  setIsVoiceChat,
  mimeType,
  patientData,
  selectPatient,
}: RecorderControlsProps) {
  return (
    <>
      {!isVoiceChat && (
        <ReactMic
          record={recording}
          className="frequencyBars"
          onStart={onStart}
          onData={onData}
          onStop={onStop}
          channelCount={2}
          autoGainControl={true}
          audioBitsPerSecond={128000}
          sampleRate={32000}
          timeSlice={60000}
          mimeType={mimeType}
          strokeColor="hsl(var(--foreground))"
          backgroundColor="hsl(var(--muted))"
        />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '2px',
        }}
      >
        {!isVoiceChat && (
          <>
            <div
              style={{
                display:
                  !isAddendum && (recording || recordingPaused || !hasMicrophoneAccess)
                    ? 'none'
                    : 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: recording || recordingPaused || !hasMicrophoneAccess ? 'pointer' : 'not-allowed',
                }}
              >
                <label className="text-sm font-medium">Addendum</label>
                <Switch
                  checked={isAddendum}
                  disabled={recording || recordingPaused || !hasMicrophoneAccess}
                  onCheckedChange={setIsAddendum}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: recording || recordingPaused ? 'not-allowed' : 'pointer',
              }}
            >
              <label className="text-sm font-medium">Voice Chat</label>
              <Switch
                checked={isVoiceChat}
                disabled={recording || recordingPaused}
                onCheckedChange={setIsVoiceChat}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={hasMicrophoneAccess ? (recording && !recordingPaused ? pauseRecording : startRecording) : undefined}
                style={{ width: '60px', height: '60px' }}
                disabled={isRecordButtonDisabled}
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
              <button onClick={stopRecording} style={{ width: '60px', height: '60px' }} hidden={!recording && !recordingPaused}>
                <svg height="60px" width="100%" viewBox="0 0 64 64" enableBackground="new 0 0 64 64">
                  <path d="M30,2C15.432,2,2,15.432,2,32c0,16.569,13.432,30,30,30s30-13.431,30-30C62,15.432,48.568,2,32,2z M47,47H17V17h30V47z" fill="hsl(var(--destructive))" />
                </svg>
              </button>
            </div>
          </>
        )}
        {isVoiceChat && (
          <MyLiveKitRoom mid={patientData.mid} onDisconnected={() => setIsVoiceChat(false)} selectPatient={selectPatient} />
        )}
      </div>
    </>
  );
}

