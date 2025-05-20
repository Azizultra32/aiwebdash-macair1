import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from '@emotion/styled';
import supabase from '@/supabase';

const VisualizerContainer = styled.div`
  height: 80vh;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const NodeContent = styled.div`
  padding: 15px;
  border-radius: 8px;
  background: white;
  border: 1px solid #ccc;
  min-width: 250px;
  max-width: 300px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .title {
    font-weight: bold;
    color: #333;
  }

  .function {
    font-size: 0.8em;
    color: #666;
  }

  .model {
    font-size: 0.8em;
    color: #0070f3;
  }

  .details {
    margin-top: 8px;
    font-size: 0.9em;
  }

  .actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
`;

const Button = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  background-color: #0070f3;
  color: white;
  &:hover {
    background-color: #0051a2;
  }
`;

const DetailPanel = styled.div<{ show: boolean }>`
  position: fixed;
  right: ${props => props.show ? '0' : '-400px'};
  top: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  transition: right 0.3s ease;
  padding: 20px;
  overflow-y: auto;

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
  }

  pre {
    background: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 10px 0;
  }
`;

interface AICall {
  id: number;
  mid: string;
  model: string;
  provider: string;
  function_name: string;
  messages: Array<{ role: string; content: string }>;
  response_text: string;
  chunk_number?: number;
  is_final?: boolean;
  created_at: string;
}

const CustomNode = ({ data }: NodeProps) => {
  const aiCall: AICall = data.aiCall;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <NodeContent>
        <div className="header">
          <div className="title">
            {aiCall.function_name}
            {aiCall.chunk_number !== undefined && ` #${aiCall.chunk_number}`}
          </div>
          {aiCall.is_final && <span className="final">Final</span>}
        </div>
        <div className="model">{aiCall.model}</div>
        <div className="actions">
          <Button onClick={() => setShowDetails(true)}>View Details</Button>
          <Button onClick={data.onEditPrompt}>Edit Prompt</Button>
        </div>
      </NodeContent>
      <Handle type="source" position={Position.Right} />

      <DetailPanel show={showDetails}>
        <div className="close" onClick={() => setShowDetails(false)}>×</div>
        <h3>AI Call Details</h3>
        <div>
          <h4>Input Messages</h4>
          {aiCall.messages.map((msg, i) => (
            <div key={i}>
              <strong>{msg.role}:</strong>
              <pre>{msg.content}</pre>
            </div>
          ))}
        </div>
        <div>
          <h4>Response</h4>
          <pre>{aiCall.response_text}</pre>
        </div>
      </DetailPanel>
    </>
  );
};

interface Props {
  mid?: string; // Optional - if not provided, will show live session
  onEditPrompt: (functionName: string) => void;
}

const PromptVisualizer = ({ mid, onEditPrompt }: Props) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const createNodeFromAICall = useCallback((aiCall: AICall, index: number) => {
    return {
      id: aiCall.id.toString(),
      type: 'custom',
      position: { x: index * 350, y: 100 },
      data: {
        aiCall,
        onEditPrompt: () => onEditPrompt(aiCall.function_name)
      }
    };
  }, [onEditPrompt]);

  const createEdgeFromNodes = useCallback((sourceId: string, targetId: string) => {
    return {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#0070f3' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#0070f3',
      },
    };
  }, []);

  const updateGraph = useCallback((aiCalls: AICall[]) => {
    // Sort by created_at and chunk_number
    const sortedCalls = [...aiCalls].sort((a, b) => {
      if (a.chunk_number !== undefined && b.chunk_number !== undefined) {
        return a.chunk_number - b.chunk_number;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    // Create nodes
    const newNodes = sortedCalls.map((call, index) => createNodeFromAICall(call, index));
    setNodes(newNodes);

    // Create edges between consecutive nodes
    const newEdges = sortedCalls.slice(1).map((_, index) => 
      createEdgeFromNodes(
        sortedCalls[index].id.toString(),
        sortedCalls[index + 1].id.toString()
      )
    );
    setEdges(newEdges);
  }, [createNodeFromAICall, createEdgeFromNodes, setNodes, setEdges]);

  useEffect(() => {
    // Initial load of historical data
    const loadHistoricalData = async () => {
      if (!mid) return;

      const { data, error } = await supabase
        .from('ai_inputs_outputs')
        .select('*')
        .eq('mid', mid)
        .order('created_at', { ascending: true });

      if (!error && data) {
        updateGraph(data);
      }
    };

    loadHistoricalData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('ai-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_inputs_outputs',
          filter: mid ? `mid=eq.${mid}` : undefined
        },
        async (payload) => {
          // Fetch all data again to ensure correct ordering
          const { data, error } = await supabase
            .from('ai_inputs_outputs')
            .select('*')
            .eq('mid', mid || payload.new.mid)
            .order('created_at', { ascending: true });

          if (!error && data) {
            updateGraph(data);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [mid, updateGraph]);

  return (
    <VisualizerContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{ custom: CustomNode }}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </VisualizerContainer>
  );
};

export default PromptVisualizer;
