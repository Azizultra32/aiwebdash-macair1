import { useEffect, useRef, useState } from 'react';
import AudioContext from '@/lib/react-mic/libs/AudioContext';

interface MicReactiveScannerProps {
  isActivated: boolean;
}

const MicReactiveScanner = ({ isActivated }: MicReactiveScannerProps) => {
  const [audioData, setAudioData] = useState(new Uint8Array(10).fill(1));
  const animationRef = useRef<number | null>(null);
  const [activationLevel, setActivationLevel] = useState(1);

  useEffect(() => {
    // Function to get the existing ReactMic instance's analyser
    const getExistingAnalyser = () => {
      return AudioContext.getAnalyser();
    };

    const updateAudioData = () => {
      const analyser = getExistingAnalyser();
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        
        // Downsample to 10 points for the scanner
        // const downsampledData = new Uint8Array(10);
        // const step = Math.floor(data.length / 10);
        // for (let i = 0; i < 10; i++) {
        //   downsampledData[i] = data[i * step];
        // }
        
        setAudioData(data);
      }
      else {
        console.log('no analyzer');
      }
      animationRef.current = window.requestAnimationFrame(updateAudioData);
    };

    // Start the animation loop
    updateAudioData();

    // Cleanup
    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let interval : any;
    if (isActivated) {
      interval = setInterval(() => {
        setActivationLevel(prev => Math.min(prev + 0.25, 1));
      }, 50);
    } else {
      interval = setInterval(() => {
        setActivationLevel(prev => Math.max(prev - 0.25, 0));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isActivated]);

  return (
    <div className="scanner-container">
      <div id='scanner'>
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={`scanner-light light-${i + 1}`} 
            style={{
              height: `${Math.max(3, audioData[i] / 8)}px`,
              backgroundColor: `rgb(0, 0, ${Math.round(activationLevel * 255)})`,
              boxShadow: `0 0 ${10 * activationLevel}px rgb(0, 0, ${Math.round(activationLevel * 255)}), inset 0 0 3px rgba(255, 255, 255, ${0.5 * activationLevel})`,
              opacity: activationLevel * 0.8 + 0.2
            }}
          ></div>
        ))}
      </div>
      
      <style>
        {`
          .scanner-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            position: relative;
            z-index: 1;
          }
          #scanner {
            width: 300px;
            height: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 10px;
          }
          .scanner-light {
            width: 25px;
            border-radius: 2px;
            transition: height 0.1s ease;
            background-color: rgb(0, 0, 255);
          }
          ${[...Array(10)].map((_, i) => `
            .light-${i + 1} {
              animation: light${i + 1} 2s infinite alternate;
            }
          `).join('')}
          
          @keyframes light1 { 0%, 100% { opacity: 0.2; } 10% { opacity: 1; } }
          @keyframes light2 { 0%, 100% { opacity: 0.2; } 20% { opacity: 1; } }
          @keyframes light3 { 0%, 100% { opacity: 0.2; } 30% { opacity: 1; } }
          @keyframes light4 { 0%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
          @keyframes light5 { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
          @keyframes light6 { 0%, 100% { opacity: 0.2; } 60% { opacity: 1; } }
          @keyframes light7 { 0%, 100% { opacity: 0.2; } 70% { opacity: 1; } }
          @keyframes light8 { 0%, 100% { opacity: 0.2; } 80% { opacity: 1; } }
          @keyframes light9 { 0%, 100% { opacity: 0.2; } 90% { opacity: 1; } }
          @keyframes light10 { 0%, 100% { opacity: 0.2; } 100% { opacity: 1; } }
        `}
      </style>
    </div>
  );
};

export default MicReactiveScanner;
