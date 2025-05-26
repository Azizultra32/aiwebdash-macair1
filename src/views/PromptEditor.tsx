import styled from '@emotion/styled';
import PromptFlow from '@/components/prompt-editor/PromptFlow';
import PromptManager from '@/components/prompt-editor/PromptManager';
import PromptTabs from '@/components/prompt-editor/PromptTabs';

const Container = styled.div`
  padding: 20px;
`;

function App() {
  return (
    <Container>
      <h1>AI Prompt Workflow Manager</h1>
      <PromptTabs
        flowComponent={<PromptFlow />}
        manageComponent={<PromptManager />}
      />
    </Container>
  );
}

export default App;
