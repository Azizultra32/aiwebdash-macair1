import { useCallback, useEffect, useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { Mic } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Switch } from './ui/switch';
import { AI_Summary, Transcript } from '@/types/types';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import moment from 'moment';

type Summary = AI_Summary['arguments']['summaries'][0];

type Props = {
  summary: Summary;
  transcript: Transcript;
};

const segments : Array<string> = [];

const TranscriptSummary = forwardRef(({ summary, transcript }: Props, ref) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRecordClicked, setIsRecordClicked] = useState(false);
  const editableRef = useRef<HTMLParagraphElement>(null);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [summaryCopy, setSummaryCopy] = useState(summary);
  const { isRecording, handleRecord: recordAudio } = useAudioRecorder((transcription) => {
    segments.push(transcription.text);
    if (summary.number === -1) {
      setSummaryCopy({
        ...summaryCopy,
        summary: segments.join(' '),
      });
    }
  });

  // Determine if this summary should show edit toggle
  const showEditToggle = ![2, 4, 6, 9].includes(summary.number);

  useImperativeHandle(ref, () => ({
    toggleMaximize: () => setIsMaximized(prev => !prev),
    getSummary: () => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 500);
      return summaryCopy.summary;
    },
  }));

  const [_, copy] = useCopyToClipboard();

  const handleCopy = useCallback((value: string) => {
    copy(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 500);
  }, [copy]);

  const handleRecord = useCallback(() => {
    recordAudio();
    setIsRecordClicked(true);
    setTimeout(() => setIsRecordClicked(false), 1000);
  }, [recordAudio]);

  const saveEdit = useCallback(() => {
    if (editMode && editableRef.current) {
      // Save changes when toggling edit mode off
      const newContent = editableRef.current.innerText;
      setSummaryCopy({
        ...summaryCopy,
        summary: newContent,
      });
      setEditedText(newContent);
      localStorage.setItem(`summary-${transcript.mid}-${summary.number}`, newContent);
    }
  }, [editMode, summaryCopy, transcript.mid, summary.number]);

  const toggleEdit = useCallback(() => {
    if (editMode) {
      saveEdit();
    }
    setEditMode(!editMode);
  }, [editMode, saveEdit]);

  useEffect(() => {
    if (isMaximized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMaximized]);
  // Effect to handle patient changes and edit mode
  useEffect(() => {
    const storedEdit = localStorage.getItem(`summary-${transcript.mid}-${summary.number}`);
    setEditedText(storedEdit);
    
    if (editMode) {
      if (storedEdit) {
        setSummaryCopy({
          ...summaryCopy,
          summary: storedEdit,
        });
      } else {
        setSummaryCopy({
          ...summaryCopy,
          summary: summary.summary,
        });
      }
    } else {
      setSummaryCopy({
        ...summaryCopy,
        summary: summary.summary,
      });
    }
  }, [editMode, summary, transcript.mid]);

  useEffect(() => {
    const storedEdit = localStorage.getItem(`summary-${transcript.mid}-${summary.number}`);
    setEditMode(storedEdit !== null);
  }, [summaryCopy.number, transcript.mid]);

  const process = useCallback((text : string) => {
    const isFinal = transcript.completed_at != null && 
                   (transcript.completed_at ?? new Date()) >= (transcript.queued_completed_at ?? new Date()) && 
                   transcript.token_count > 0 && 
                   (transcript.is_paused ?? false) === false;
    const momentOfVisit = moment(transcript.created_at);
    const dateOfVisit = momentOfVisit.format('DD-MMM-YY');
    const timeOfVisit = momentOfVisit.format('HH:mm');

    // Use project-defined color variables instead of hard-coded values
    const statusColor = isFinal
      ? 'hsl(var(--success))'
      : 'hsl(var(--destructive))';
    const headerColor = isFinal ? statusColor : 'hsl(var(--primary))';

    if (summaryCopy.number === 1 && (editedText === null || !editMode)) {
      return <>
        <span style={{color: headerColor}}>Armada Provider Assist</span><br />
        <span style={{color: statusColor}}><b>{isFinal ? "Summary: Finalized" : "Summary In Progress"}</b></span><br /><br />
        <span>Date of visit: {dateOfVisit}</span><br />
        <span>Time: {timeOfVisit}</span><br /><br />
        <span>{text}</span><br /><br />
        <b style={{color: 'hsl(var(--muted-foreground))'}}>
          CoPilot: Armada AssistMD & AssistPRO<br />
          With Ambient Scribe and Evolved Solutions (AS|ES) (TM)<br />
          {"{MPE-ARM-P24.1}"}
        </b>
      </>;
    }
    return text;
  }, [summaryCopy, transcript, editMode, editedText]);

  const processedText = useMemo(() => process(summaryCopy.summary), [process, summaryCopy]);

  if (isMaximized) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMaximized(false)} />
        <div className="fixed inset-4 left-64 z-50 bg-background rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              {showEditToggle && (
                <>
                  <span className="text-sm">edit</span>
                  <Switch
                    checked={editMode}
                    onCheckedChange={toggleEdit}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </>
              )}
            </div>
          </div>
          <ScrollArea className="flex-grow p-4">
            <p 
              ref={editableRef}
              className="whitespace-pre-line" 
              contentEditable={editMode}
              suppressContentEditableWarning={true}
              onBlur={saveEdit}
              onClick={() => handleCopy(summaryCopy.summary)}
              style={isCopied ? { backgroundColor: 'hsl(var(--accent))' } : {}}
            >
              {processedText}
            </p>
          </ScrollArea>
        </div>
      </>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          {showEditToggle && (
            <>
              <span className="text-sm">edit</span>
              <Switch
                checked={editMode}
                onCheckedChange={toggleEdit}
                className="data-[state=checked]:bg-orange-500"
              />
            </>
          )}
          {summary.number === -1 && (
            <TooltipProvider>
              <Tooltip delayDuration={300} open={isRecordClicked}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRecord}
                  >
                    <Mic size={16} color={isRecording ? 'red' : 'black'} />
                    <span className="sr-only">{isRecording ? 'Stop recording' : 'Record summary'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? 'Transcribing...' : 'Ending transcript...'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <p 
          ref={editableRef}
          className="whitespace-pre-line" 
          contentEditable={editMode}
          suppressContentEditableWarning={true}
          onBlur={saveEdit}
          onClick={() => handleCopy(summaryCopy.summary)}
          style={isCopied ? { backgroundColor: 'hsl(var(--accent))' } : {}}
        >
          {processedText}
        </p>
      </ScrollArea>
    </div>
  );
});

export default TranscriptSummary;
