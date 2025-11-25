import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { TelegramProvider } from "./contexts/TelegramContext";
import { BottomNav } from "./components/BottomNav";
import HomeTab from "./pages/HomeTab";
import SecretSantaTab from "./pages/SecretSantaTab";
import RandomizersTab from "./pages/RandomizersTab";
import CalendarTab from "./pages/CalendarTab";
import ProfileTab from "./pages/ProfileTab";
import PublicWishlist from "./pages/PublicWishlist";

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Check for invite code in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('inviteCode');
    if (code) {
      setInviteCode(code);
      setActiveTab('santa'); // Auto-switch to Santa tab
      // Clear URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onNavigate={setActiveTab} />;
      case 'santa':
        return <SecretSantaTab inviteCode={inviteCode} onInviteHandled={() => setInviteCode(null)} />;
      case 'randomizers':
        return <RandomizersTab />;
      case 'calendar':
        return <CalendarTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-lg mx-auto">
        {renderActiveTab()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TelegramProvider>
        <ThemeProvider defaultTheme="light" switchable>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Switch>
                <Route path="/wishlist/:userId">
                  {(params) => <PublicWishlist userId={parseInt(params.userId)} />}
                </Route>
                <Route path="/">
                  <MainApp />
                </Route>
              </Switch>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TelegramProvider>
    </ErrorBoundary>
  );
}

export default App;
