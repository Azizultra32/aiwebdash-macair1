import { useState } from 'react';
import { getPromptSuggestions } from '@/lib/v0';

interface Props {
  prompt: string;
}

function PromptSuggestions({ prompt }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const result = await getPromptSuggestions(prompt);
    setSuggestions(result);
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Suggest Improvements'}
      </button>
      {suggestions.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PromptSuggestions;
