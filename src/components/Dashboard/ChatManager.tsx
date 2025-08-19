import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { WebChat } from "./WebChat";
import { MessageSquare, Search, Filter, MoreVertical, Bot, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  status: 'active' | 'archived' | 'closed';
  characterProfile?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function ChatManager() {
  const [activeTab, setActiveTab] = useState("live-chat");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');

  // Mock data - replace with actual data fetching
  useEffect(() => {
    const mockSessions: ChatSession[] = [
      {
        id: '1',
        title: 'Content Strategy Discussion',
        lastMessage: 'Can you help me plan next week\'s content?',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        messageCount: 12,
        status: 'active',
        characterProfile: {
          id: '1',
          name: 'Aurion',
          avatar_url: '/src/assets/aurion-avatar.jpg'
        }
      },
      {
        id: '2',
        title: 'Schedule Optimization',
        lastMessage: 'The automated posting is working great!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        messageCount: 8,
        status: 'active',
        characterProfile: {
          id: '2',
          name: 'Caelum',
          avatar_url: '/src/assets/caelum-avatar.jpg'
        }
      },
      {
        id: '3',
        title: 'Campaign Analysis',
        lastMessage: 'Let me analyze the performance metrics...',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        messageCount: 23,
        status: 'archived'
      }
    ];
    setChatSessions(mockSessions);
  }, []);

  const handleNewMessage = (message: any) => {
    // Handle new message from WebChat component
    console.log('New message:', message);
  };

  const filteredSessions = chatSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">💬 Chat Manager</h1>
        <p className="text-muted-foreground">Manage conversations and live chat with your AI characters</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
          <TabsTrigger value="conversations">Message History</TabsTrigger>
          <TabsTrigger value="analytics">Chat Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="live-chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Start New Conversation</h3>
              <WebChat 
                characterProfile={{
                  id: '1',
                  name: 'Aurion',
                  avatar_url: '/src/assets/aurion-avatar.jpg',
                  description: 'Content Strategy AI'
                }}
                onMessageSent={handleNewMessage}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Bot className="h-5 w-5 text-primary" />
                      <span className="font-medium">Content Planning Assistant</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get help planning your content strategy and scheduling posts.
                    </p>
                    <Button size="sm" className="w-full">Start Chat</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="font-medium">Analytics Review</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Discuss performance metrics and optimization strategies.
                    </p>
                    <Button size="sm" variant="outline" className="w-full">Start Chat</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Bot className="h-5 w-5 text-primary" />
                      <span className="font-medium">Technical Support</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get help with dashboard features and troubleshooting.
                    </p>
                    <Button size="sm" variant="outline" className="w-full">Start Chat</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter: {filterStatus === 'all' ? 'All' : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Conversations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                  Active Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('archived')}>
                  Archived Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.characterProfile?.avatar_url} />
                        <AvatarFallback>
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{session.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(session.status)}`}
                          >
                            {session.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {session.lastMessage}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimestamp(session.timestamp)}</span>
                          <span>{session.messageCount} messages</span>
                          {session.characterProfile && (
                            <span>with {session.characterProfile.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>View Conversation</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem>Export</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2s</div>
                <p className="text-xs text-muted-foreground">-0.3s improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chat Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chat analytics dashboard coming soon!</p>
                <p className="text-sm">Track conversation metrics, response times, and user engagement.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}