
import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRateLimit } from '@/hooks/useRateLimit';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rateLimit = useRateLimit();

  const suggestions = [
    "What made Steve Jobs such an effective leader?",
    "How did Bezos build Amazon's long-term thinking culture?",
    "What can modern founders learn from Henry Ford?",
    "Tell me about Walt Disney's approach to innovation",
    "How did Sam Walton build Walmart's competitive advantage?"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  return (
    <div className="sticky bottom-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {showSuggestions && !message && (
        <div className="container px-4 pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => selectSuggestion(suggestion)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-all hover:scale-105"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="container px-4 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any founder or business principle..."
                disabled={disabled}
                className="min-h-[44px] max-h-[120px] resize-none pr-12 font-mono text-sm bg-card/50 border-border/60 focus:border-primary/60 transition-colors"
                rows={1}
              />
              
              <div className="absolute right-2 top-2 flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={!message.trim() || disabled}
              className="h-11 w-11 p-0 bg-primary hover:bg-primary/90 transition-all hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {rateLimit.isLimited && (
                <span className="text-destructive">
                  Rate limited. Reset in {rateLimit.timeUntilReset}m
                </span>
              )}
              {!rateLimit.isLimited && (
                <span className="text-primary">
                  {rateLimit.queriesRemaining}/{rateLimit.userTier === 'authenticated' ? '10' : '3'} queries left
                </span>
              )}
            </div>
            <span>{message.length}/2000</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
