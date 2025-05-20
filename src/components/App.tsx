import { Toaster } from '@/components/ui/toaster';
import { GlobalStateProvider } from '@/context/GlobalStateContext';
import Routes from './Routes';

function App() {
  return (
    <GlobalStateProvider>
      <div className="App" style={{ overflow: 'hidden', height: '100vh' }}>
        <Toaster />
        <Routes />
      </div>
    </GlobalStateProvider>
  );
}

export default App;
