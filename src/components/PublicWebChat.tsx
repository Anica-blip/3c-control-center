import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
}

export function PublicWebChat() {
  console.log("PublicWebChat component loading...");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const character = {
    name: "Aurion",
    avatar: "/src/assets/aurion-avatar.jpg",
    description: "Your AI companion"
  };

  useEffect(() => {
    // Check if Supabase is available
    try {
      if (supabase) {
        setSupabaseReady(true);
        createChatSession();
      }
    } catch (error) {
      console.error('Supabase initialization error:', error);
      setSupabaseReady(false);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const createChatSession = async () => {
    if (!supabaseReady) return;
    
    try {
      await supabase.from('public_chat_sessions').insert({
        session_id: sessionId,
        user_identifier: 'anonymous',
        status: 'active'
      });
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
  };

  const saveMessage = async (userMessage: string, botResponse: string, responseTime: number) => {
    try {
      await supabase.from('public_chat_messages').insert({
        session_id: sessionId,
        user_message: userMessage,
        bot_response: botResponse,
        response_time_ms: responseTime,
        status: 'completed'
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const addMessage = (content: string, role: "user" | "assistant", status?: "sending" | "sent" | "failed") => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
      status
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessageStatus = (id: string, status: "sending" | "sent" | "failed") => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, status } : msg
    ));
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setIsLoading(true);

    const userMessageId = addMessage(userMessage, "user", "sending");
    updateMessageStatus(userMessageId, "sent");

    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          provider: 'inference' // Default to inference.net for cost efficiency
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) throw error;

      const response = data?.response || "I apologize, but I'm having trouble responding right now. Please try again.";
      addMessage(response, "assistant", "sent");
      
      await saveMessage(userMessage, response, responseTime);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackResponse = "I'm sorry, I'm experiencing technical difficulties. Please try again later.";
      addMessage(fallbackResponse, "assistant", "failed");
      
      await saveMessage(userMessage, fallbackResponse, Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat shadow-2xl border-0" 
            style={{ 
              backgroundImage: "url('/src/assets/webchat-mobile-bg.png')",
              backdropFilter: "blur(10px)"
            }}>
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={character.avatar} alt={character.name} />
              <AvatarFallback>{character.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{character.name}</h3>
              <p className="text-sm text-muted-foreground">{character.description}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>Start a conversation with {character.name}</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/90 text-foreground shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className={`text-xs mt-1 ${
                      message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {formatTime(message.timestamp)}
                      {message.status === "sending" && " • Sending..."}
                      {message.status === "failed" && " • Failed"}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/90 text-foreground rounded-lg px-3 py-2 text-sm shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="bg-white/90 backdrop-blur-sm p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !currentMessage.trim()}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="px-3">
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}