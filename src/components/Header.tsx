
import { useState } from 'react';
import { Moon, Sun, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { GoogleAuth } from './GoogleAuth';
import SettingsModal from './SettingsModal';

interface HeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

const Header = ({ isDark, onThemeToggle }: HeaderProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <SidebarTrigger />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-sm">F</span>
            </div>
            <h1 className="font-serif font-semibold text-xl text-foreground">
              Founders Podcast Agent
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <GoogleAuth />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="text-muted-foreground hover:text-foreground transition-all duration-300"
            >
              {isDark ? (
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all" />
              ) : (
                <Moon className="h-4 w-4 rotate-0 scale-100 transition-all" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={showSettings} onOpenChange={setShowSettings} />
    </>
  );
};

export default Header;
