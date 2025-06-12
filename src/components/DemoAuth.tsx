import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DemoAuthProps {
  onLogin: () => void;
}

const DemoAuth = ({ onLogin }: DemoAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = () => {
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">AssistMD Demo</CardTitle>
          <p className="text-gray-600">Healthcare AI Assistant</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            <p>🚀 Demo Mode Active</p>
            <p>No real authentication required</p>
          </div>
          
          <Button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Logging in...' : 'Enter Demo'}
          </Button>
          
          <div className="text-xs text-gray-400 text-center">
            <p>✅ All features available</p>
            <p>✅ Voice recording & AI transcription</p>
            <p>✅ Medical summaries & SOAP notes</p>
            <p>✅ Prompt editor & AI workflows</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoAuth;
