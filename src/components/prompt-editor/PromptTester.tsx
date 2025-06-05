import { useState } from 'react';

const PromptTester = () => {
  const [prompt, setPrompt] = useState('');
  const [preview, setPreview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now just echo the prompt as preview
    setPreview(prompt);
  };

  return (
    <div data-testid="prompt-tester" className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          className="w-full min-h-[150px] border p-2 font-mono"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt text"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Preview
        </button>
      </form>
      {preview && (
        <div className="rounded border p-2">
          <h3 className="mb-2 font-bold">Preview</h3>
          <pre className="whitespace-pre-wrap break-words">{preview}</pre>
        </div>
      )}
    </div>
  );
};

export default PromptTester;
