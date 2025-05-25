import { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge,
  Node,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType
} from 'reactflow';
import { logger } from '@/utils/logger';
import 'reactflow/dist/style.css';
import styled from '@emotion/styled';
import supabase from '@/supabase';

const FlowContainer = styled.div`
  height: 80vh;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const NodeContent = styled.div`
  padding: 10px;
  border-radius: 5px;
  background: white;
  border: 1px solid #ccc;
  max-width: 300px;

  .title {
    font-weight: bold;
    margin-bottom: 4px;
  }

  .key {
    font-size: 0.8em;
    color: #666;
    margin-top: 4px;
  }

  .order {
    font-size: 0.8em;
    color: #666;
  }

  .inactive {
    color: #dc2626;
    font-size: 0.8em;
    margin-top: 4px;
  }
`;

interface PromptComponent {
  id: number;
  created_at: string;
  prompt_key: string;
  title: string;
  prompt_text: string;
  sort_order: number;
  is_active: boolean;
}

const PromptFlow = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [_, setPrompts] = useState<PromptComponent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      logger.debug('Fetching prompts...');
      const { data, error } = await supabase
        .from('system_prompt_components')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('Error fetching prompts:', error);
        setError(error.message);
        return;
      }

      logger.debug('Fetched prompts', data);
      setPrompts(data || []);
      createNodesAndEdges(data || []);
    } catch (err) {
      console.error('Error in fetchPrompts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const createNodesAndEdges = (promptData: PromptComponent[]) => {
    logger.debug('Creating nodes and edges for', promptData);
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Calculate positions based on sort_order
    const spacing = { x: 300, y: 100 };
    const startPos = { x: 100, y: 100 };
    
    // Create nodes for each component
    promptData.forEach((component, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      newNodes.push({
        id: component.prompt_key,
        position: { 
          x: startPos.x + (col * spacing.x), 
          y: startPos.y + (row * spacing.y)
        },
        data: { 
          label: (
            <NodeContent>
              <div className="title">{component.title}</div>
              <div className="key">Key: {component.prompt_key}</div>
              <div className="order">Order: {component.sort_order}</div>
              {!component.is_active && (
                <div className="inactive">Inactive</div>
              )}
            </NodeContent>
          )
        },
        type: 'default',
        style: {
          opacity: component.is_active ? 1 : 0.5
        }
      });

      // Create edge to next component if it exists and is active
      if (index < promptData.length - 1 && component.is_active && promptData[index + 1].is_active) {
        newEdges.push({
          id: `e${component.prompt_key}-${promptData[index + 1].prompt_key}`,
          source: component.prompt_key,
          target: promptData[index + 1].prompt_key,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#2563eb' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#2563eb',
          },
        });
      }
    });

    logger.debug('Setting nodes', newNodes);
    logger.debug('Setting edges', newEdges);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <FlowContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </FlowContainer>
  );
};

export default PromptFlow;
