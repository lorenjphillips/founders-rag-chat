
import { useState, useEffect } from 'react';
import { Copy, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  const [displayedText, setDisplayedText] = useState(isUser ? message : '');
  const [showCursor, setShowCursor] = useState(!isUser);

  useEffect(() => {
    if (!isUser) {
      let i = 0;
      const typewriter = setInterval(() => {
        if (i < message.length) {
          setDisplayedText(message.slice(0, i + 1));
          i++;
        } else {
          setShowCursor(false);
          clearInterval(typewriter);
        }
      }, 30);

      return () => clearInterval(typewriter);
    }
  }, [message, isUser]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard.",
    });
  };

  // Detect and highlight quotes
  const formatMessageWithQuotes = (text: string) => {
    const quoteRegex = /"([^"]+)"/g;
    const parts = text.split(quoteRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} className="relative">
            <Quote className="inline w-4 h-4 mr-1 opacity-60" />
            <span className="italic font-medium text-primary">"{part}"</span>
            <Quote className="inline w-4 h-4 ml-1 opacity-60 rotate-180" />
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in-up group`}>
      <div className={`${isUser ? 'chat-bubble-user' : 'chat-bubble-agent'} relative`}>
        {!isUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
        
        <div className={`${isUser ? 'text-right' : 'text-left'} ${!isUser ? 'pr-8' : ''}`}>
          <div className={`${isUser ? 'font-mono text-sm' : 'font-serif text-base leading-relaxed'}`}>
            {isUser ? message : (
              <span>
                {formatMessageWithQuotes(displayedText)}
                {showCursor && <span className="animate-blink ml-1">|</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
