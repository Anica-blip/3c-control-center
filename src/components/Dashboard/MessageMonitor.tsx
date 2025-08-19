
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function MessageMonitor() {
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalMessages: 0,
    avgResponseTime: 0,
    successRate: 0
  });

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('public_chat_messages')
        .select(`
          *,
          public_chat_sessions!inner (
            session_id,
            user_identifier
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedMessages = data?.map((msg: any) => ({
        id: msg.id,
        user: msg.public_chat_sessions.user_identifier || 'Anonymous',
        message: msg.user_message,
        response: msg.bot_response,
        timestamp: new Date(msg.timestamp).toLocaleString(),
        status: msg.status === 'completed' ? 'responded' : msg.status,
        responseTime: msg.response_time_ms
      })) || [];

      setMessages(formattedMessages);

      // Calculate stats
      if (formattedMessages.length > 0) {
        const completedMessages = formattedMessages.filter(m => m.status === 'responded');
        const avgTime = completedMessages.reduce((acc, msg) => acc + (msg.responseTime || 0), 0) / completedMessages.length;
        
        setStats({
          totalMessages: formattedMessages.length,
          avgResponseTime: avgTime,
          successRate: (completedMessages.length / formattedMessages.length) * 100
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('message-monitor')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'public_chat_messages'
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredMessages = messages.filter(msg =>
    msg.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.response.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Message Monitor</h1>
        <p className="text-muted-foreground">Track user interactions and bot responses in real-time</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchMessages}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredMessages.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No messages found</p>
            </CardContent>
          </Card>
        )}
        {filteredMessages.map((msg) => (
          <Card key={msg.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{msg.user}</CardTitle>
                  <CardDescription>{msg.timestamp}</CardDescription>
                </div>
                <Badge variant={msg.status === "responded" ? "default" : "secondary"}>
                  {msg.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">User Message:</h4>
                <p className="text-sm bg-muted p-3 rounded-md">{msg.message}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Bot Response:</h4>
                <p className="text-sm bg-primary/10 p-3 rounded-md border border-primary/20">{msg.response}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Statistics</CardTitle>
          <CardDescription>Real-time message monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.avgResponseTime ? `${(stats.avgResponseTime / 1000).toFixed(1)}s` : '0s'}</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.successRate ? `${stats.successRate.toFixed(0)}%` : '0%'}</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
