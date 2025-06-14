import { User, LogOut, Settings } from 'lucide-react';
import FontSizeSelector from './FontSizeSelector';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate , Link } from 'react-router-dom';
import { Transcript } from '@/types/types';
import MicReactiveScanner from './kitt-scanner-component';
import { ProgressBar } from '@/components/ui/progress';
import { useGlobalState } from '@/context/GlobalStateContext';
import { useEffect, useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import supabase from '@/supabase';
interface Props {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  showSidebar: boolean;
  isDesktop: boolean;
  recording: boolean;
  onlineTranscripts?: Transcript[];
  clientTranscripts?: Transcript[];
}

interface PropsHeader {
  isDesktop: boolean;
  recording: boolean;
  onlineTranscripts?: Transcript[];
  clientTranscripts?: Transcript[];
}

interface PropsSidebar {
  sidebar: React.ReactNode;
  showSidebar: boolean;
  isDesktop: boolean;
}

const DashboardSidebar = ({ sidebar, showSidebar, isDesktop }: PropsSidebar) => {
  return (
    <aside
      className={cn(
        'bg-muted text-muted-foreground flex flex-col fixed top-[65px] bottom-0 transition-transform duration-200 ease-in-out',
        isDesktop ? 'w-64 left-0' : 'w-full',
        isDesktop ? 'translate-x-0' : (showSidebar ? 'translate-x-0' : '-translate-x-full'),
        'z-40'
      )}
    >
      {sidebar}
    </aside>
  );
};

const DashboardHeader = ({
  isDesktop,
  recording,
  onlineTranscripts,
  clientTranscripts
}: PropsHeader) => {
  const {
    getUser: { data: user },
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const { state, updateTranscriptCount } = useGlobalState();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planName, setPlanName] = useState<string>('');
  
  const TRIAL_LIMIT = 105;

  const uniqueTranscriptsCount = useMemo(() => {
    const allTranscripts = [...(onlineTranscripts || []), ...(clientTranscripts || [])];
    const uniqueTranscripts = Array.from(new Map(allTranscripts.map(t => [t.mid, t])).values());
    return uniqueTranscripts.length;
  }, [onlineTranscripts, clientTranscripts]);

  useEffect(() => {
    if (state.transcriptCount !== uniqueTranscriptsCount) {
      updateTranscriptCount(uniqueTranscriptsCount);
    }
  }, [uniqueTranscriptsCount, state.transcriptCount, updateTranscriptCount]);

  const isTrialLimitReached = state.transcriptCount >= TRIAL_LIMIT;

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) return;
      
      const { data: subscription } = await supabase
        .from('UserSubscriptions')
        .select('*, Plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subscription?.Plans?.name) {
        setIsSubscribed(true);
        setPlanName(subscription.Plans.name);
      }
    };

    checkSubscription();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-primary text-primary-foreground fixed top-0 left-0 right-0 z-50 h-[65px]">
      <div className="flex justify-between items-center h-full px-4">
        <Link to="/" className="flex items-center">
          <div
            className={cn(
              'cursor-pointer relative overflow-hidden flex items-center justify-center h-full transition-all duration-200 ease-in-out',
              isDesktop ? 'w-[160px]' : 'w-[100px]'
            )}
          >
            <img
              src="/1@2x.png"
              alt="Logo"
              className="h-8 w-auto object-contain filter brightness-0 invert max-w-full transition-transform duration-200 ease-in-out"
            />
            <span className="sr-only">Home</span>
          </div>
        </Link>

        <div className="absolute left-1/2 transform -translate-x-1/2 w-[300px] h-10">
          <MicReactiveScanner isActivated={recording} />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">
              {user?.email || user?.phone || 'No user info'}
            </span>
          </div>
          
          {isSubscribed ? (
            // Show only plan name for subscribed users
            <span className="text-[8px] sm:text-xs md:text-sm lg:text-base font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {planName}
            </span>
          ) : (
            // Show full trial info for non-subscribed users
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2">
                <div className="w-24">
                  <ProgressBar 
                    value={state.transcriptCount} 
                    max={TRIAL_LIMIT}
                    className={isTrialLimitReached ? "text-red-500" : undefined}
                  />
                </div>
                <span className={`text-[8px] sm:text-xs md:text-sm lg:text-base whitespace-nowrap ${
                  isTrialLimitReached ? 'text-red-500' : ''
                }`}>
                  {state.transcriptCount}/{TRIAL_LIMIT}
                </span>
              </div>

              <Link
                to="/billing"
                className="text-[8px] sm:text-xs md:text-sm lg:text-base font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap"
              >
                {isTrialLimitReached ? 'Upgrade Now' : 'Upgrade'}
              </Link>
              <span className="text-[8px] sm:text-xs md:text-sm lg:text-base font-semibold px-1 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                Trial
              </span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="p-1 sm:p-2 md:p-3"
                variant="ghost"
                size="sm"
              >
                <span className="flex items-center justify-center">
                  <Settings
                    size={isDesktop ? 24 : 14}
                    className="transform scale-90 sm:scale-100"
                  />
                </span>
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  to="/billing"
                  className="cursor-pointer"
                >
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/prompt-playground"
                  className="cursor-pointer"
                >
                  Prompt Playground
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/prompt-visualizer"
                  className="cursor-pointer"
                >
                  Prompt Visualizer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/moa-workflow"
                  className="cursor-pointer"
                >
                  MOA Workflow
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/"
                  className="cursor-pointer"
                >
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <div className="px-4 py-2">
                <FontSizeSelector />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

const DashboardLayout = ({
  children,
  sidebar,
  showSidebar,
  isDesktop,
  recording,
  onlineTranscripts,
  clientTranscripts
}: Props) => {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <DashboardHeader
        isDesktop={isDesktop}
        recording={recording}
        onlineTranscripts={onlineTranscripts}
        clientTranscripts={clientTranscripts}
      />
      <div className="flex flex-1">
        <DashboardSidebar 
          showSidebar={showSidebar} 
          sidebar={sidebar}
          isDesktop={isDesktop}
        />
        <main 
          className={cn(
            'flex-1 transition-all duration-200 ease-in-out pt-[65px] overflow-hidden',
            isDesktop ? 'lg:pl-64' : '',
            !isDesktop && showSidebar ? 'hidden' : 'block'
          )}
        >
          <div className="h-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
    
  );
};

export default DashboardLayout;
