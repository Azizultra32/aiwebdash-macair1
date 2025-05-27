import React, { useCallback, useEffect, useState } from 'react';
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
import supabase from '@/supabase';
import { Card } from '@/components/ui/card'

const FlowContainerClasses =
  'h-[80vh] w-full border border-gray-300 rounded-lg overflow-hidden'

const NodeContent: React.FC<{ component: PromptComponent }> = ({ component }) => (
  <div className="p-2 rounded border border-gray-300 bg-white max-w-[300px]">
    <div className="font-bold mb-1">{component.title}</div>
    <div className="text-xs text-gray-600 mt-1">Key: {component.prompt_key}</div>
    <div className="text-xs text-gray-600">Order: {component.sort_order}</div>
    {!component.is_active && (
      <div className="text-red-600 text-xs mt-1">Inactive</div>
    )}
  </div>
)

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
          label: <NodeContent component={component} />
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
    <Card className={FlowContainerClasses}>
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
    </Card>
  );
};

export default PromptFlow;
