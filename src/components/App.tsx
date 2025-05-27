import { Toaster } from '@/components/ui/toaster';
import { GlobalStateProvider } from '@/context/GlobalStateContext';
import Routes from './Routes';

function App() {
  return (
    <GlobalStateProvider>
      <div className="App h-screen overflow-hidden">
        <Toaster />
        <Routes />
      </div>
    </GlobalStateProvider>
  );
}

export default App;
