
import { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ isOpen, onOpenChange }: SettingsModalProps) => {
  const [flickerEnabled, setFlickerEnabled] = useState(true);

  const handleFlickerToggle = (enabled: boolean) => {
    setFlickerEnabled(enabled);
    // Update CSS custom property to control flickering
    document.documentElement.style.setProperty(
      '--constellation-flicker',
      enabled ? '1' : '0'
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <Settings className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="font-serif text-xl">Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customize your Founders Agent experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="flicker-toggle" className="text-sm font-medium">
                Star Flickering
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable or disable the twinkling effect of background stars
              </p>
            </div>
            <Switch
              id="flicker-toggle"
              checked={flickerEnabled}
              onCheckedChange={handleFlickerToggle}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
