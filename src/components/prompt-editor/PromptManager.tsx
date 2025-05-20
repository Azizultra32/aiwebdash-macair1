import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import supabase from '@/supabase';
import PromptVisualizer from './PromptVisualizer';

const Container = styled.div`
  padding: 20px;
`;

const TabBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.active ? '#0070f3' : '#e9ecef'};
  color: ${props => props.active ? 'white' : '#333'};
  &:hover {
    background-color: ${props => props.active ? '#0051a2' : '#dee2e6'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f4f4f4;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #0070f3;
  color: white;
  &:hover {
    background-color: #0051a2;
  }
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 600px;
  margin: 20px 0;
  
  textarea {
    min-height: 400px;
    min-width: 600px;
    padding: 8px;
    font-family: monospace;
  }
  
  input, select {
    padding: 8px;
  }
`;

const PreviewSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  
  h3 {
    margin-bottom: 10px;
  }
  
  .message {
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .system {
    background-color: #e9ecef;
    border: 1px solid #dee2e6;
  }

  .user {
    background-color: #e3f2fd;
    border: 1px solid #bbdefb;
  }

  .role-label {
    font-size: 0.8em;
    color: #666;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
`;

const Legend = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ddd;

  h4 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .variable {
    font-family: monospace;
    background-color: #e9ecef;
    padding: 2px 6px;
    border-radius: 3px;
    margin-right: 10px;
  }

  .description {
    color: #666;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 8px;
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
`;

const SUPERUSER_ID = '91201600-b62c-4a5e-b2a8-d6784e582b90';

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

type ViewMode = 'edit' | 'visualize';

const PromptManager = () => {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [assembledPrompt, setAssembledPrompt] = useState<any[]>([]);
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
        console.log('Current user:', user);
        setUser(user);
        
        if (user?.id === SUPERUSER_ID) {
          console.log('User is superuser, fetching data...');
          await Promise.all([fetchPrompts(), fetchRecentMeetings()]);
        } else {
          console.log('User is not superuser, skipping data fetch');
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
    const { data, error } = await supabase
      .from('transcripts2')
      .select('mid, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      // Get unique meetings
      const uniqueMeetings = Array.from(new Set(data.map(d => d.mid)))
        .map(mid => {
          const meeting = data.find(d => d.mid === mid);
          return {
            mid,
            created_at: meeting!.created_at
          };
        });
      setRecentMeetings(uniqueMeetings);
    }
  };

  const fetchPrompts = async () => {
    console.log('Fetching prompts...');
    const { data, error } = await supabase
      .from('system_prompt_components')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Error fetching prompts:', error);
      return;
    }

    console.log('Received prompts:', data);
    setPrompts(data);
    fetchAssembledPrompt();
  };

  const fetchAssembledPrompt = async () => {
    console.log('Fetching assembled prompt...');
    const { data, error } = await supabase
      .rpc('assemble_system_prompt', {
        test_transcript: 'Doctor: Hello, how are you feeling today?\nPatient: I have been having headaches.',
        test_translated_transcript: null
      });

    if (error) {
      console.error('Error fetching assembled prompt:', error);
      return;
    }

    console.log('Received assembled prompt:', data);
    if (data) {
      setAssembledPrompt(data);
    }
  };

  const handleEdit = (prompt: any) => {
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
      user_id: SUPERUSER_ID
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
            user_id: SUPERUSER_ID
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

  // Only show component if user is superuser
  if (user?.id !== SUPERUSER_ID) {
    console.log('User is not superuser. Current user ID:', user?.id);
    console.log('Expected superuser ID:', SUPERUSER_ID);
    return <div>Access denied. You must be a superuser to view this page.</div>;
  }
  console.log('User is superuser, rendering component');

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
            value={selectedMid} 
            onChange={(e) => setSelectedMid(e.target.value)}
            style={{ marginBottom: '20px', padding: '8px' }}
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
            <h4>Available Variables</h4>
            <ul>
              {AVAILABLE_VARIABLES.map(variable => (
                <li key={variable.name}>
                  <span className="variable">{`{${variable.name}}`}</span>
                  <span className="description">{variable.description}</span>
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
                  type="text"
                  value={editingPrompt.prompt_key}
                  onChange={(e) => setEditingPrompt({
                    ...editingPrompt,
                    prompt_key: e.target.value
                  })}
                  required
                />
              </div>
              
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  value={editingPrompt.title}
                  onChange={(e) => setEditingPrompt({
                    ...editingPrompt,
                    title: e.target.value
                  })}
                  required
                />
              </div>
              
              <div>
                <label>Role:</label>
                <select
                  value={editingPrompt.prompt_role}
                  onChange={(e) => setEditingPrompt({
                    ...editingPrompt,
                    prompt_role: e.target.value
                  })}
                  required
                >
                  <option value="system">System</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div>
                <label>Sort Order:</label>
                <input
                  type="number"
                  value={editingPrompt.sort_order}
                  onChange={(e) => setEditingPrompt({
                    ...editingPrompt,
                    sort_order: parseInt(e.target.value)
                  })}
                  required
                />
              </div>
              
              <div>
                <label>Active:</label>
                <input
                  type="checkbox"
                  checked={editingPrompt.is_active}
                  onChange={(e) => setEditingPrompt({
                    ...editingPrompt,
                    is_active: e.target.checked
                  })}
                />
              </div>
              
              <div>
                <label>Prompt Text (use variables like {'{transcript}'}):</label>
                <textarea
                  value={editingPrompt.prompt_text}
                  onChange={(e) => setEditingPrompt({
                    ...editingPrompt,
                    prompt_text: e.target.value
                  })}
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
                    <th>Key</th>
                    <th>Title</th>
                    <th>Role</th>
                    <th>Order</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((prompt) => (
                    <tr key={prompt.id}>
                      <td>{prompt.prompt_key}</td>
                      <td>{prompt.title}</td>
                      <td>{prompt.prompt_role}</td>
                      <td>{prompt.sort_order}</td>
                      <td>{prompt.is_active ? 'Yes' : 'No'}</td>
                      <td>
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
                  <div key={index} className={`message ${message.role}`}>
                    <div className="role-label">{message.role}</div>
                    {message.content}
                  </div>
                ))}
              </PreviewSection>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default PromptManager;
