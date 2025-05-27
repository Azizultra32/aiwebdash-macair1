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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import supabase from '@/supabase';

const FlowContainerClasses = 'h-[80vh] w-full';

interface PromptData {
  mid: string;
  agent_code: string;
  prompt_key: string;
  title?: string;
  order?: number;
  is_active?: boolean;
}

const PromptFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [promptData, setPromptData] = useState<PromptData[]>([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    // Fetch prompts from Supabase
    const fetchPrompts = async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('mid, agent_code, prompt_key, title, order, is_active')
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching prompts:', error);
        return;
      }

      if (data) {
        setPromptData(data);
      }
    };

    fetchPrompts();
  }, []);

  useEffect(() => {
    if (promptData.length === 0) return;

    // Create nodes from prompt data
    const newNodes: Node[] = promptData.map((prompt, index) => ({
      id: prompt.prompt_key,
      position: { x: index * 250, y: 100 },
      data: {
        label: (
          <Card className="p-2.5 max-w-[300px]">
            <div className="font-bold mb-1">{prompt.title || prompt.prompt_key}</div>
            <div className="text-xs text-muted-foreground">Key: {prompt.prompt_key}</div>
            <div className="text-xs text-muted-foreground">Order: {prompt.order}</div>
            {!prompt.is_active && (
              <div className="text-xs text-destructive mt-1">Inactive</div>
            )}
            <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
              {prompt.agent_code}
            </Badge>
          </Card>
        ),
      },
      type: 'default',
    }));

    setNodes(newNodes);

    // Create edges between consecutive prompts
    const newEdges: Edge[] = [];
    for (let index = 0; index < promptData.length - 1; index++) {
      if (promptData[index].is_active && promptData[index + 1].is_active) {
        newEdges.push({
          id: `edge-${index}`,
          source: promptData[index].prompt_key,
          target: promptData[index + 1].prompt_key,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--ring))' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--ring))',
          },
        });
      }
    }

    setEdges(newEdges);
  }, [promptData, setNodes, setEdges]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prompt Flow</h2>
        <Button variant="outline">Refresh</Button>
      </div>
      <Card className={FlowContainerClasses}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        />
      </Card>
    </div>
  );
};

export default PromptFlow;