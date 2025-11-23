import { useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BottomNav } from "./components/BottomNav";
import HomeTab from "./pages/HomeTab";
import SecretSantaTab from "./pages/SecretSantaTab";
import RandomizersTab from "./pages/RandomizersTab";
import ProfileTab from "./pages/ProfileTab";

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onNavigate={setActiveTab} />;
      case 'santa':
        return <SecretSantaTab />;
      case 'randomizers':
        return <RandomizersTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <div className="min-h-screen bg-background text-foreground">
              <main className="max-w-lg mx-auto">
                {renderActiveTab()}
              </main>
              <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
