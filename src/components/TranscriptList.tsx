import { Transcript, TranscriptData } from '@/types/types';
import moment from 'moment';
import { Lock, Unlock, Trash, Mic, ShieldAlert, Upload, ArrowRight, Check } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect, useRef } from 'react';
import VirtualList, { VirtualListRef } from './VirtualList';
import supabase from '@/supabase';
import { Button } from './ui/button';
import OnlineStatusIndicator from '@/components/OnlineStatusIndicator';

type Props = {
  transcripts: Transcript[];
  selectedTranscript?: Transcript;
  onSelectTranscript: (transcript: Transcript) => void;
  onDeleteTranscript: (patient: TranscriptData) => void;
  recordingPatientMidUUID?: string;
  uploadingPatientMidUUID?: string;
  offlineQueueCount: number;
};

const TranscriptList = ({ 
  transcripts, 
  selectedTranscript, 
  onSelectTranscript, 
  onDeleteTranscript, 
  recordingPatientMidUUID, 
  uploadingPatientMidUUID,
  offlineQueueCount,
}: Props) => {
  const [unlock, setUnlock] = useState<Record<number, boolean>>({});
  const [patientName, setPatientName] = useState<string>("");
  const selectedRef = useRef<HTMLButtonElement>(null);

  const listRef = useRef<VirtualListRef | null>(null);

  const ROW_HEIGHT = 72;
  const OVERSCAN = 5;
  const VIRTUAL_THRESHOLD = 30;

  const handleRename = async (editedText: string, mid: string) => {
    const { data, error } = await supabase.from('transcripts2').update({ patient_code: editedText }).eq('mid', mid);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  };


  const TranscriptRow = ({
    patient,
    index,
    isSelected,
  }: {
    patient: Transcript;
    index: number;
    isSelected: boolean;
  }) => (
    <Button
      key={patient.mid}
      ref={isSelected && transcripts.length <= VIRTUAL_THRESHOLD ? selectedRef : null}
      variant={isSelected ? 'default' : 'ghost'}
      className="w-full justify-start py-3 overflow-hidden"
      style={{ height: ROW_HEIGHT }}
      onClick={() => onSelectTranscript(patient)}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span
              className="font-medium"
              contentEditable={unlock[index]}
              style={unlock[index] ? { outline: 'none', boxShadow: '0-2px 0 #fff inset' } : {}}
              spellCheck={false}
              onClick={(e: React.MouseEvent) => {
                if (unlock[index]) {
                  e.stopPropagation();
                }
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setUnlock({ ...unlock, [index]: false });
                  handleRename(e.currentTarget.textContent || '', patient.mid);
                } else if (e.key !== 'Backspace' && e.currentTarget.textContent!.length >= 12) {
                  e.preventDefault();
                }
              }}
              onKeyUp={(e: React.KeyboardEvent<HTMLSpanElement>) => {
                setPatientName(e.currentTarget.textContent || '');
              }}
            >
              {patient.patient_code}
            </span>
            <span className="font-medium">{patient.patient_tag}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {moment(patient.created_at).format('DD-MMM-YY | h:mm')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {unlock[index] ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setUnlock({ ...unlock, [index]: false });
                  onDeleteTranscript(patient);
                }}
              >
                <Trash className="h-4 w-4 text-gray-500 hover:text-red-500" />
                <span className="sr-only">Delete transcript</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setUnlock({ ...unlock, [index]: false });
                  handleRename(patientName || patient.patient_code, patient.mid);
                }}
              >
                <Unlock className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                <span className="sr-only">Save name</span>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setUnlock({ ...unlock, [index]: true });
                setPatientName(patient.patient_code);
              }}
            >
              <Lock className="h-4 w-4" />
              <span className="sr-only">Edit name</span>
            </Button>
          )}
          {patient.mid === recordingPatientMidUUID ? (
            <>
              <Mic className="h-4 w-4 text-blue-500" />
              <span className="sr-only">Recording</span>
            </>
          ) : patient.mid === uploadingPatientMidUUID ? (
            <>
              <Upload className="h-4 w-4 text-blue-500" />
              <span className="sr-only">Uploading</span>
            </>
          ) : isFinal(patient) ? (
            <>
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <span className="sr-only">Finalized</span>
            </>
          ) : patient.error ? (
            <>
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              <span className="sr-only">Error</span>
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">In progress</span>
            </>
          )}
        </div>
      </div>
    </Button>
  );

  const isFinal = (transcript: Transcript) => {
    return transcript.completed_at != null && 
           (transcript.completed_at ?? new Date()) >= (transcript.queued_completed_at ?? new Date()) && 
           transcript.token_count > 0 && 
           (transcript.is_paused ?? false) === false;
  };

  useEffect(() => {
    if (transcripts.length > VIRTUAL_THRESHOLD) {
      const idx = transcripts.findIndex(t => t.mid === selectedTranscript?.mid);
      if (idx !== -1 && listRef.current) {
        listRef.current.scrollTo(idx * ROW_HEIGHT);
      }
    } else if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedTranscript?.mid, transcripts.length]);


  return (
    <div className="w-full md:w-64 bg-white h-full flex flex-col border-r border-gray-200">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100">
        <h2 className="font-semibold">Patient List</h2>
        <div className="flex items-center gap-2">
          <OnlineStatusIndicator />
          {offlineQueueCount > 0 && (
            <span className="text-sm text-yellow-500">
              {offlineQueueCount} action{offlineQueueCount > 1 ? 's' : ''} pending
            </span>
          )}
        </div>
      </div>
      {transcripts.length <= VIRTUAL_THRESHOLD ? (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {transcripts.map((patient, index) => (
              <TranscriptRow
                key={patient.mid}
                index={index}
                patient={patient}
                isSelected={selectedTranscript?.mid === patient.mid}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <VirtualList
          ref={listRef}
          itemCount={transcripts.length}
          itemSize={ROW_HEIGHT}
          overscan={OVERSCAN}
        >
          {(index, style) => {
            const patient = transcripts[index];
            return (
              <div style={style} key={patient.mid}>
                <TranscriptRow
                  index={index}
                  patient={patient}
                  isSelected={selectedTranscript?.mid === patient.mid}
                />
              </div>
            );
          }}
        </VirtualList>
      )}
      {selectedTranscript && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full p-4 rounded-md bg-blue-100 relative">
              <div className="flex justify-between items-start">
                <span className="text-lg font-medium text-blue-800">
                  {selectedTranscript.patient_code}
                </span>
                <span className="text-xs text-blue-600">
                  {moment(selectedTranscript.created_at).format('DD-MMM-YY | h:mm')}
                </span>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                {isFinal(selectedTranscript) ? (
                  <Check className="h-4 w-4 text-blue-700" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptList;
