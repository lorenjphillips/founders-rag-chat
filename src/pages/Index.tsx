import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ConstellationBackground from '@/components/ConstellationBackground';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import { ragService } from '@/lib/ragService';
import { useRateLimit } from '@/hooks/useRateLimit';
import type { SearchResult } from '@/lib/qdrant';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: SearchResult[];
}

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rateLimit = useRateLimit();

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      text: `Welcome to the Founders Agent. I'm trained on David Senra's Founders Podcast, containing insights from biographies of history's most successful entrepreneurs. Ask me about business strategy, leadership principles, or the mindsets that built the world's greatest companies.

What would you like to learn from the masters of business?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending messages with RAG
  const handleSendMessage = async (messageText: string) => {
    // Check rate limit
    if (!rateLimit.consumeQuery()) {
      return; // Rate limited, ChatInput will show the limit
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Use RAG service for real AI response
      const ragResponse = await ragService.search(messageText);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: ragResponse.answer,
        isUser: false,
        timestamp: new Date(),
        sources: ragResponse.sources.slice(0, 3) // Limit to 3 sources
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error while searching the transcripts. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ConstellationBackground />
        
        <ChatHistorySidebar />
        
        <div className="flex-1 flex flex-col">
          <Header isDark={isDark} onThemeToggle={toggleTheme} />
          
          <main className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-4xl mx-auto px-4 py-8">
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatMessage
                      message={message.text}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                    />
                    {/* Show sources for AI messages */}
                    {!message.isUser && message.sources && message.sources.length > 0 && (
                      <div className="ml-4 mb-6 max-w-3xl space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Episode References ({message.sources.length})
                        </div>
                        {message.sources.map((source, index) => (
                          <div key={source.id} className="bg-card/50 border border-border/60 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">{source.payload.main_subject}</div>
                              <div className="flex gap-2">
                                <span className="text-xs bg-secondary px-2 py-1 rounded">
                                  Episode #{source.payload.episode_number}
                                </span>
                                <span className="text-xs bg-accent px-2 py-1 rounded">
                                  {Math.round(source.score * 100)}% match
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed mb-2">
                              {source.payload.chunk_text.length > 200 
                                ? source.payload.chunk_text.substring(0, 200) + '...'
                                : source.payload.chunk_text}
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Chunk {source.payload.chunk_index + 1}</span>
                              <span>{source.payload.chunk_tokens} tokens</span>
                            </div>
                            {source.payload.url && (
                              <div className="mt-2">
                                <a 
                                  href={source.payload.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                  Listen to full episode →
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start mb-6 animate-fade-in-up">
                    <div className="chat-bubble-agent">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground font-serif italic">
                          Searching transcripts...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isTyping || rateLimit.isLimited} 
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;