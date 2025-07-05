import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ConstellationBackground from '@/components/ConstellationBackground';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample responses from the Founders Agent
  const sampleResponses = [
    `Steve Jobs believed that "the desktop metaphor was a revolutionary way to make computing accessible to everyone." His approach was to focus obsessively on the user experience, often saying "Design is not just what it looks like and feels like. Design is how it works." He would spend months perfecting seemingly minor details because he understood that great products are built through relentless attention to what others might consider insignificant.`,
    
    `Jeff Bezos built Amazon on the principle of long-term thinking. As he often said, "We are willing to be misunderstood for long periods of time." His Day 1 mentality meant always operating with the urgency and customer obsession of a startup, regardless of Amazon's size. Bezos understood that "your margin is my opportunity" - he would consistently sacrifice short-term profits to deliver better value to customers.`,
    
    `Henry Ford revolutionized not just manufacturing, but business itself. "Whether you think you can or think you can't, you're right," Ford believed. His assembly line wasn't just about efficiency - it was about democratizing products that were once luxuries. Ford paid his workers well above market rates because he understood they needed to afford the cars they were building. This created a virtuous cycle of demand and prosperity.`,
    
    `Walt Disney's genius lay in his ability to combine storytelling with technological innovation. "It's kind of fun to do the impossible," he would say. Disney understood that emotion drives all great entertainment. He pioneered the storyboard, created the first synchronized sound cartoon, and built theme parks that weren't just rides but immersive experiences. His secret was making people feel wonder.`,
    
    `Sam Walton built Walmart on a simple principle: "There is only one boss. The customer. And he can fire everybody in the company from the chairman on down, simply by spending his money somewhere else." Walton's competitive advantage wasn't just low prices - it was his ability to build systems and culture at scale while maintaining the personal touch of a small-town merchant.`
  ];

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

  // Handle sending messages
  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
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
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
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
                          Consulting the founders...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
