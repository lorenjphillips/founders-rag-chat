
import { useState } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const ChatHistorySidebar = () => {
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Steve Jobs & Innovation',
      lastMessage: 'Tell me about Steve Jobs approach to product design...',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: '2',
      title: 'Bezos Long-term Thinking',
      lastMessage: 'How did Jeff Bezos build Amazon with long-term vision?',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
    },
    {
      id: '3',
      title: 'Disney & Storytelling',
      lastMessage: 'What made Walt Disney so successful in entertainment?',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
    },
  ]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <Sidebar className="w-80 border-r border-border/40" collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-serif text-lg font-semibold">
            Chat History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatSessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton asChild className="h-auto p-3 hover:bg-muted/50">
                    <div className="flex items-start space-x-3 w-full">
                      <MessageCircle className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate mb-1">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mb-1">
                          {session.lastMessage}
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                          {formatDate(session.timestamp)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default ChatHistorySidebar;
