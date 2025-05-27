import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from 'styled-components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import supabase from '@/supabase';

const VisualizerContainer = styled.div`
  height: 80vh;
  width: 100%;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
`;

const NodeContent = styled.div`
  padding: 15px;
  border-radius: 8px;
  background: white;
  border: 1px solid hsl(var(--border));
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
    color: hsl(var(--foreground));
  }

  .function {
    font-size: 0.8em;
    color: hsl(var(--muted-foreground));
  }

  .model {
    font-size: 0.8em;
    color: hsl(var(--ring));
  }

  .details {
    margin-top: 8px;
    padding-top: 8px;
    /* Use border design token */
    border-top: 1px solid hsl(var(--border));
  }

  .content {
    margin-top: 8px;
    font-size: 0.9em;
    /* Muted foreground for better theme support */
    color: hsl(var(--muted-foreground));
    max-height: 100px;
    overflow-y: auto;
  }
`;

const Button = styled.button`
  padding: 4px 8px;
  margin: 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  background-color: hsl(var(--ring));
  color: white;
  &:hover {
    background-color: hsla(var(--ring) / 0.8);
  }
`;

const DetailPanel = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  right: ${(props) => (props.show ? '0' : '-400px')};
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
  transition: right 0.3s ease;
  z-index: 1000;

  h3 {
    margin-top: 0;
  }

  pre {
    background: hsl(var(--muted));
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
`;

interface PromptData {
  mid: string;
  agent_code: string;
  prompt_key: string;
  title?: string;
  content?: string;
  function?: string;
  model?: string;
  order?: number;
  is_active?: boolean;
}

interface Props {
  mid?: string;
  onEditPrompt?: (promptKey: string) => void;
}

const PromptVisualizer = ({ mid, onEditPrompt }: Props) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [promptData, setPromptData] = useState<PromptData[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleNodeClick = (prompt: PromptData) => {
    setSelectedPrompt(prompt);
    setShowDetailPanel(true);
  };

  const handleEditPrompt = (promptKey: string) => {
    if (onEditPrompt) {
      onEditPrompt(promptKey);
    }
    setShowDetailPanel(false);
  };

  useEffect(() => {
    // Fetch prompts from Supabase
    const fetchPrompts = async () => {
      let query = supabase
        .from('prompts')
        .select('mid, agent_code, prompt_key, title, content, function, model, order, is_active')
        .order('order', { ascending: true });

      if (mid) {
        query = query.eq('mid', mid);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching prompts:', error);
        return;
      }

      if (data) {
        setPromptData(data);
      }
    };

    fetchPrompts();
  }, [mid]);

  // Create a connection between two prompts in sequence
  const createEdge = useCallback((sourceId: string, targetId: string, index: number) => {
    return {
      id: `edge-${index}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--ring))' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--ring))',
      },
    };
  }, []);

  useEffect(() => {
    if (promptData.length === 0) return;

    // Create nodes from prompt data
    const newNodes: Node[] = promptData.map((prompt, index) => ({
      id: prompt.prompt_key,
      position: { x: index * 300, y: 100 },
      data: {
        label: (
          <NodeContent>
            <div className="header">
              <div className="title">{prompt.title || prompt.prompt_key}</div>
              <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                {prompt.agent_code}
              </Badge>
            </div>
            {prompt.function && <div className="function">Function: {prompt.function}</div>}
            {prompt.model && <div className="model">Model: {prompt.model}</div>}
            <div className="details">
              <Button onClick={() => handleNodeClick(prompt)}>View Details</Button>
              <Button onClick={() => handleEditPrompt(prompt.prompt_key)}>Edit</Button>
            </div>
            {prompt.content && (
              <div className="content">
                {prompt.content.length > 100
                  ? `${prompt.content.substring(0, 100)}...`
                  : prompt.content}
              </div>
            )}
          </NodeContent>
        ),
      },
      type: 'default',
    }));

    setNodes(newNodes);

    // Create edges between consecutive prompts
    const newEdges: Edge[] = [];
    for (let index = 0; index < promptData.length - 1; index++) {
      if (promptData[index].is_active && promptData[index + 1].is_active) {
        newEdges.push(
          createEdge(
            promptData[index].prompt_key,
            promptData[index + 1].prompt_key,
            index,
          ),
        );
      }
    }

    setEdges(newEdges);
  }, [promptData, setNodes, setEdges, createEdge]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prompt Visualizer</h2>
        <Button variant="outline">Refresh</Button>
      </div>
      <VisualizerContainer>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        />
      </VisualizerContainer>
      <DetailPanel show={showDetailPanel}>
        <Button onClick={() => setShowDetailPanel(false)}>Close</Button>
        {selectedPrompt && (
          <div>
            <h3>{selectedPrompt.title || selectedPrompt.prompt_key}</h3>
            <p><strong>Agent:</strong> {selectedPrompt.agent_code}</p>
            <p><strong>Key:</strong> {selectedPrompt.prompt_key}</p>
            {selectedPrompt.function && <p><strong>Function:</strong> {selectedPrompt.function}</p>}
            {selectedPrompt.model && <p><strong>Model:</strong> {selectedPrompt.model}</p>}
            <p><strong>Order:</strong> {selectedPrompt.order}</p>
            <p><strong>Active:</strong> {selectedPrompt.is_active ? 'Yes' : 'No'}</p>
            {selectedPrompt.content && (
              <div>
                <h4>Content:</h4>
                <pre>{selectedPrompt.content}</pre>
              </div>
            )}
            <Button onClick={() => handleEditPrompt(selectedPrompt.prompt_key)}>
              Edit Prompt
            </Button>
          </div>
        )}
      </DetailPanel>
    </div>
  );
};

export default PromptVisualizer;