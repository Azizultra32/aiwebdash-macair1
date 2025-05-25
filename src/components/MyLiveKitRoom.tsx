import supabase from '@/supabase';
import { logger } from '@/utils/logger';
import { AnimatePresence, motion } from "framer-motion";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
} from "@livekit/components-react";
import { useCallback, useEffect, useState } from "react";
import { MediaDeviceFailure, Room } from "livekit-client";
import { NoAgentNotification } from "./ui/no-agent-notification";
import { CloseIcon } from "./ui/close-icon";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import "@livekit/components-styles";
import { RpcError, RpcInvocationData } from 'livekit-client';

interface LiveKitRoomProps {
  mid: string;
  onDisconnected: () => void;
  selectPatient: (patientTag: number) => void;
}

type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

export function MyLiveKitRoom({ mid, onDisconnected, selectPatient } : LiveKitRoomProps) {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [room] = useState<Room>(new Room())

  useEffect(() => {
    room.localParticipant?.registerRpcMethod(
      'end_call',
      async (data: RpcInvocationData) => {
          logger.debug(`Received end_call`, { caller: data.callerIdentity, payload: data.payload });
          try {
              room.disconnect(true);
              return JSON.stringify({});
          } catch (error) {
              throw new RpcError(1, "Could not end the call on the browser");
          }
      }
    );
    room.localParticipant?.registerRpcMethod(
      'select_patient',
      async (data: RpcInvocationData) => {
          logger.debug('select_patient request', { caller: data.callerIdentity, payload: data.payload });
          try {
              const params = JSON.parse(data.payload);
              logger.debug('select_patient params', params);
              selectPatient(params.patientTag);
              return JSON.stringify({});
          } catch (error) {
              throw new RpcError(1, "Could not select the patient");
          }
      }
    );
  }, [room]);

  const onConnectButtonClicked = useCallback(async () => {
    const { data } = await supabase.functions.invoke('live-room-join', {
      body: JSON.stringify({ mid }),
    });
    updateConnectionDetails(data);
  }, []);

  useEffect(() => {
    logger.debug('agentState update', { state: agentState });
  }, [agentState]);

  return (
    <main
      data-lk-theme="default"
      className="h-full w-full max-w-[400px] max-h-[250px] overflow-hidden bg-[var(--lk-bg)] mx-auto rounded-md scale-90"
    >
      <LiveKitRoom
        token={connectionDetails?.participantToken}
        serverUrl={connectionDetails?.serverUrl}
        connect={connectionDetails !== undefined}
        audio={true}
        video={false}
        onMediaDeviceFailure={onDeviceFailure}
        onDisconnected={() => {
          updateConnectionDetails(undefined);
          setIsDisconnecting(true);
          setTimeout(() => onDisconnected(), 3000);
        }}
        onConnected={async () => {
          logger.debug('onConnected', { room: room.name, participant: room.localParticipant?.identity });
        }}
        className="grid grid-rows-[1fr_auto] items-center gap-1 p-2 scale-80"
        room={room}
      >
        <SimpleVoiceAssistant onStateChange={setAgentState} />
        <ControlBar
          onConnectButtonClicked={onConnectButtonClicked}
          agentState={agentState}
          isDisconnecting={isDisconnecting}
        />
        <RoomAudioRenderer />
        <NoAgentNotification state={agentState} didShowNotification={() => {
          setIsDisconnecting(true);
          setTimeout(() => onDisconnected(), 3000);
        }} />
      </LiveKitRoom>
    </main>
  );
}

function SimpleVoiceAssistant(props: {
  onStateChange: (state: AgentState) => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();
  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);
  return (
    <div className="h-[100px] max-w-[240] w-full mx-auto">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer scale-50 ml-[-70px]"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar(props: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
  isDisconnecting: boolean;
}) {
  /**
   * Use Krisp background noise reduction when available.
   * Note: This is only available on Scale plan, see {@link https://livekit.io/pricing | LiveKit Pricing} for more details.
   */
  const krisp = useKrispNoiseFilter();
  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
    props.onConnectButtonClicked();
  }, []);

  return (
    <div className="relative h-[40px] w-full flex">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase px-4 py-2 bg-white text-black rounded-md"
            onClick={() => props.onConnectButtonClicked()}
            disabled={true}
          >
            {props.isDisconnecting && ("Disconnecting...")}
            {!props.isDisconnecting && ("Connecting...")}
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {props.agentState !== "disconnected" &&
          props.agentState !== "connecting" && (
            <motion.div
              initial={{ opacity: 0, top: "10px" }}
              animate={{ opacity: 1, top: 0 }}
              exit={{ opacity: 0, top: "-10px" }}
              transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
              className="flex h-8"
            >
              <VoiceAssistantControlBar controls={{ leave: false }} style={{ margin: '-15px 0px 0px 0px' }} />
              <DisconnectButton>
                <CloseIcon />
              </DisconnectButton>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
