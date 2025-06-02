import {
  useState,
  useEffect,
  type PropsWithChildren,
  type ButtonHTMLAttributes,
  type FormHTMLAttributes,
} from 'react';
import supabase from '@/supabase';
import { logger } from '@/utils/logger';
import type { Transcript } from '@/types/types';
import PromptVisualizer from './PromptVisualizer';
import PromptSuggestions from './PromptSuggestions';

const Container = ({ children }: PropsWithChildren) => (
  <div className="p-5">{children}</div>
);

const TabBar = ({ children }: PropsWithChildren) => (
  <div className="mb-5 flex gap-2.5">{children}</div>
);

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const Tab = ({ active, className = '', ...props }: TabProps) => {
  const base = 'px-4 py-2 rounded';
  const activeClasses = active
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  return <button className={`${base} ${activeClasses} ${className}`} {...props} />;
};

const Table = ({ children }: PropsWithChildren) => (
  <table className="mb-5 w-full border-collapse text-left">{children}</table>
);

const Button = ({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`mx-1 rounded border-none bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${className}`}
    {...props}
  />
);

const EditForm = ({ children, ...props }: PropsWithChildren<React.FormHTMLAttributes<HTMLFormElement>>) => (
  <form className="my-5 flex max-w-[600px] flex-col gap-2.5" {...props}>{children}</form>
);

const PreviewSection = ({ children }: PropsWithChildren) => (
  <div className="mt-5 rounded bg-gray-100 p-5">{children}</div>
);

const Legend = ({ children }: PropsWithChildren) => (
  <div className="my-5 rounded border border-gray-300 bg-gray-100 p-4">{children}</div>
);

const SUPERUSER_ID = '91201600-b62c-4a5e-b2a8-d6784e582b90';
// Comma-separated list of user IDs allowed to manage prompts.
const AUTHORIZED_IDS = import.meta.env.VITE_PROMPT_MANAGER_IDS
  ? (import.meta.env.VITE_PROMPT_MANAGER_IDS as string).split(',')
  : [SUPERUSER_ID];

const AVAILABLE_VARIABLES = [
  {
    name: 'transcript',
    description: 'The transcript text. Will use translated version if available.',
  },
  {
    name: 'system_ai_prompt',
    description: 'The assembled system prompt (from previous components).',
  }
];

interface PromptComponent {
  id?: number;
  prompt_key: string;
  title: string;
  prompt_text: string;
  sort_order: number;
  is_active: boolean;
  prompt_role: string;
  variables: Record<string, string>;
  user_id?: string;
}

interface ChatMessage {
  role: string;
  content: string;
}

type ViewMode = 'edit' | 'visualize';

const PromptManager = () => {
  const [prompts, setPrompts] = useState<PromptComponent[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<PromptComponent | null>(null);
  const [assembledPrompt, setAssembledPrompt] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [selectedMid, setSelectedMid] = useState<string>('');
  const [recentMeetings, setRecentMeetings] = useState<Array<{mid: string, created_at: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        logger.debug('Current user', user);
        setUser(user);
        
        if (user && AUTHORIZED_IDS.includes(user.id)) {
          logger.debug('User is authorized, fetching data...');
          await Promise.all([fetchPrompts(), fetchRecentMeetings()]);
        } else {
          logger.debug('User is not authorized, skipping data fetch');
        }
      } catch (error) {
        console.error('Error initializing component:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeComponent();
  }, []);

  const fetchRecentMeetings = async () => {
    const response = await fetch('/api/transcripts');
    if (!response.ok) return;
    const data = (await response.json()) as Transcript[];
    const sorted = data
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
    const uniqueMeetings = Array.from(new Set(sorted.map((d) => d.mid))).map((mid) => {
      const meeting = sorted.find((d) => d.mid === mid)!;
      return { mid, created_at: meeting.created_at };
    });
    setRecentMeetings(uniqueMeetings);
  };

  const fetchPrompts = async () => {
    logger.debug('Fetching prompts...');
    const { data, error } = await supabase
      .from('system_prompt_components')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Error fetching prompts:', error);
      return;
    }

    logger.debug('Received prompts', data);
    setPrompts(data as PromptComponent[]);
    fetchAssembledPrompt();
  };

  const fetchAssembledPrompt = async () => {
    logger.debug('Fetching assembled prompt...');
    const { data, error } = await supabase
      .rpc('assemble_system_prompt', {
        test_transcript: 'Doctor: Hello, how are you feeling today?\nPatient: I have been having headaches.',
        test_translated_transcript: null
      });

    if (error) {
      console.error('Error fetching assembled prompt:', error);
      return;
    }

    logger.debug('Received assembled prompt', data);
    if (data) {
      setAssembledPrompt(data as ChatMessage[]);
    }
  };

  const handleEdit = (prompt: PromptComponent) => {
    setEditingPrompt({ 
      ...prompt,
      variables: prompt.variables || {}
    });
  };

  const handleAdd = () => {
    setEditingPrompt({
      prompt_key: '',
      title: '',
      prompt_text: '',
      sort_order: prompts.length,
      is_active: true,
      prompt_role: 'system',
      variables: {},
      user_id: user?.id
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt) return;
    
    const { error } = editingPrompt.id
      ? await supabase
          .from('system_prompt_components')
          .update({
            prompt_key: editingPrompt.prompt_key,
            title: editingPrompt.title,
            prompt_text: editingPrompt.prompt_text,
            sort_order: editingPrompt.sort_order,
            is_active: editingPrompt.is_active,
            prompt_role: editingPrompt.prompt_role,
            variables: editingPrompt.variables
          })
          .eq('id', editingPrompt.id)
      : await supabase
          .from('system_prompt_components')
          .insert([{
            prompt_key: editingPrompt.prompt_key,
            title: editingPrompt.title,
            prompt_text: editingPrompt.prompt_text,
            sort_order: editingPrompt.sort_order,
            is_active: editingPrompt.is_active,
            prompt_role: editingPrompt.prompt_role,
            variables: editingPrompt.variables,
            user_id: user?.id ?? editingPrompt.user_id
          }]);

    if (error) {
      console.error('Error updating prompt:', error);
      return;
    }

    setEditingPrompt(null);
    fetchPrompts();
  };

  const handleEditFromVisualizer = (functionName: string) => {
    const prompt = prompts.find(p => p.prompt_key === functionName);
    if (prompt) {
      setViewMode('edit');
      handleEdit(prompt);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Only show component if user is authorized
  if (!user || !AUTHORIZED_IDS.includes(user.id)) {
    logger.debug('User is not authorized', { currentId: user?.id, allowed: AUTHORIZED_IDS });
    return <div>Access denied. You must be authorized to view this page.</div>;
  }
  logger.debug('User is authorized, rendering component');

  return (
    <Container>
      <TabBar>
        <Tab active={viewMode === 'edit'} onClick={() => setViewMode('edit')}>
          Edit Prompts
        </Tab>
        <Tab active={viewMode === 'visualize'} onClick={() => setViewMode('visualize')}>
          Visualize Calls
        </Tab>
      </TabBar>

      {viewMode === 'visualize' && (
        <div>
          <select
            className="mb-5 p-2"
            value={selectedMid}
            onChange={(e) => setSelectedMid(e.target.value)}
          >
            <option value="">Select a meeting...</option>
            {recentMeetings.map(meeting => (
              <option key={meeting.mid} value={meeting.mid}>
                {new Date(meeting.created_at).toLocaleString()} - {meeting.mid}
              </option>
            ))}
          </select>
          {selectedMid && (
            <PromptVisualizer 
              mid={selectedMid} 
              onEditPrompt={handleEditFromVisualizer}
            />
          )}
        </div>
      )}

      {viewMode === 'edit' && (
        <>
          <Legend>
            <h4 className="mb-2 font-semibold text-gray-800">Available Variables</h4>
            <ul className="list-none p-0 m-0">
              {AVAILABLE_VARIABLES.map((variable) => (
                <li key={variable.name} className="mb-2 flex items-baseline gap-2.5">
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 font-mono">{`{${variable.name}}`}</span>
                  <span className="text-gray-600">{variable.description}</span>
                </li>
              ))}
            </ul>
          </Legend>

          <Button onClick={handleAdd}>Add New Component</Button>
          
          {editingPrompt ? (
            <EditForm onSubmit={handleUpdate}>
              <h3>{editingPrompt.id ? 'Edit' : 'Add'} Prompt Component</h3>
              
              <div>
                <label>Key:</label>
                <input
                  className="p-2"
                  type="text"
                  value={editingPrompt.prompt_key}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      prompt_key: e.target.value,
                    })
                  }
                  required
                />
              </div>
              
              <div>
                <label>Title:</label>
                <input
                  className="p-2"
                  type="text"
                  value={editingPrompt.title}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              
              <div>
                <label>Role:</label>
                <select
                  className="p-2"
                  value={editingPrompt.prompt_role}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      prompt_role: e.target.value,
                    })
                  }
                  required
                >
                  <option value="system">System</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div>
                <label>Sort Order:</label>
                <input
                  className="p-2"
                  type="number"
                  value={editingPrompt.sort_order}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      sort_order: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              
              <div>
                <label>Active:</label>
                <input
                  className="ml-2"
                  type="checkbox"
                  checked={editingPrompt.is_active}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      is_active: e.target.checked,
                    })
                  }
                />
              </div>
              
              <div>
                <label>Prompt Text (use variables like {'{transcript}'}):</label>
                <textarea
                  className="min-h-[400px] min-w-[600px] p-2 font-mono"
                  value={editingPrompt.prompt_text}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      prompt_text: e.target.value,
                    })
                  }
                  required
                />
              </div>
              
              <div>
                <Button type="submit">Save</Button>
                <Button type="button" onClick={() => setEditingPrompt(null)}>
                  Cancel
                </Button>
              </div>
            </EditForm>
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <th className="border bg-gray-100 p-2">Key</th>
                    <th className="border bg-gray-100 p-2">Title</th>
                    <th className="border bg-gray-100 p-2">Role</th>
                    <th className="border bg-gray-100 p-2">Order</th>
                    <th className="border bg-gray-100 p-2">Active</th>
                    <th className="border bg-gray-100 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((prompt) => (
                    <tr key={prompt.id}>
                      <td className="border p-2">{prompt.prompt_key}</td>
                      <td className="border p-2">{prompt.title}</td>
                      <td className="border p-2">{prompt.prompt_role}</td>
                      <td className="border p-2">{prompt.sort_order}</td>
                      <td className="border p-2">{prompt.is_active ? 'Yes' : 'No'}</td>
                      <td className="border p-2">
                        <Button onClick={() => handleEdit(prompt)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <PreviewSection>
                <h3>Assembled Prompt Preview</h3>
                <p>Using test transcript: "Doctor: Hello, how are you feeling today? / Patient: I have been having headaches."</p>
                {assembledPrompt.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 rounded border p-2.5 font-mono whitespace-pre-wrap break-words ${
                      message.role === 'system'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="mb-1 text-xs uppercase text-gray-600">
                      {message.role}
                    </div>
                    {message.content}
                  </div>
                ))}
                <PromptSuggestions prompt={assembledPrompt.map(m => m.content).join('\n')} />
              </PreviewSection>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default PromptManager;
