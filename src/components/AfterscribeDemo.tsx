import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import FloatingAfterscribe from './FloatingAfterscribe';
import FloatingAfterscribeManager from './FloatingAfterscribeManager';
import { Smartphone, Monitor, Move, Mic, Copy, Sparkles } from 'lucide-react';

export default function AfterscribeDemo() {
  const [showEmbedded, setShowEmbedded] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Afterscribe™ Demo
            </CardTitle>
            <p className="text-gray-600">
              Floating, Mobile-Friendly, Draggable AI Transcription Assistant
            </p>
          </CardHeader>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Move className="h-5 w-5 text-blue-500" />
                <span>Draggable</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Click and drag to move the component anywhere on screen. 
                Works on both desktop and mobile devices.
              </p>
              <Badge variant="secondary" className="mt-2">Touch Friendly</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-green-500" />
                <span>Mobile Optimized</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Responsive design that adapts to mobile screens. 
                Touch gestures work perfectly on tablets and phones.
              </p>
              <Badge variant="secondary" className="mt-2">Responsive</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-5 w-5 text-red-500" />
                <span>Voice Recognition</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Real-time speech-to-text transcription with voice commands.
                Perfect for medical note-taking.
              </p>
              <Badge variant="secondary" className="mt-2">AI Powered</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Copy className="h-5 w-5 text-purple-500" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Copy to clipboard, navigate history, and submit notes 
                with keyboard shortcuts and buttons.
              </p>
              <Badge variant="secondary" className="mt-2">Efficient</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>AI Grammar Check</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Built-in grammar checking and text enhancement 
                powered by AI for professional documentation.
              </p>
              <Badge variant="secondary" className="mt-2">Smart</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-indigo-500" />
                <span>Floating Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Can be embedded in pages or float independently. 
                Minimizable and always accessible.
              </p>
              <Badge variant="secondary" className="mt-2">Flexible</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Try It Out</CardTitle>
            <p className="text-gray-600">
              Toggle between embedded and floating modes to see the difference.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowEmbedded(true)}
                variant={showEmbedded ? "default" : "outline"}
              >
                Embedded Mode
              </Button>
              <Button 
                onClick={() => setShowEmbedded(false)}
                variant={!showEmbedded ? "default" : "outline"}
              >
                Floating Mode
              </Button>
            </div>

            {showEmbedded && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-4">Embedded Afterscribe:</p>
                <div className="h-[220px]">
                  <FloatingAfterscribe isFloating={false} />
                </div>
              </div>
            )}

            {!showEmbedded && (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Look for the blue floating button in the bottom-right corner!
                </p>
                <p className="text-sm text-gray-500">
                  Click it to open the floating Afterscribe component.
                  Then drag it around the screen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Click the microphone button to start voice transcription</li>
              <li>Speak your notes - they'll appear in real-time</li>
              <li>Use the arrow buttons to navigate through history</li>
              <li>Click the sparkles button for AI grammar checking</li>
              <li>Copy your notes with the copy button</li>
              <li>Minimize/maximize with the window controls</li>
              <li>In floating mode: drag the component anywhere on screen</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Floating Manager - only show in floating mode */}
      {!showEmbedded && <FloatingAfterscribeManager />}
    </div>
  );
}
