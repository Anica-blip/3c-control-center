import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import webchatMobileBg from "@/assets/webchat-mobile-bg.png";
import webchatDesktopBg from "@/assets/webchat-desktop-bg.png";

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface WebChatProps {
  characterProfile?: {
    id: string;
    name: string;
    avatar_url?: string;
    description?: string;
  };
  onMessageSent?: (message: ChatMessage) => void;
}

export function WebChat({ characterProfile, onMessageSent }: WebChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
    };
    setMessages(prev => [...prev, newMessage]);
    onMessageSent?.(newMessage);
    return newMessage;
  };

  const updateMessageStatus = (messageId: string, status: ChatMessage['status']) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    ));
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = addMessage({
      content: currentMessage,
      role: 'user',
      timestamp: new Date(),
      status: 'sending'
    });

    const messageContent = currentMessage;
    setCurrentMessage("");
    setIsLoading(true);

    try {
      updateMessageStatus(userMessage.id, 'sent');
      
      // Add typing indicator
      const typingMessage = addMessage({
        content: "...",
        role: 'assistant',
        timestamp: new Date(),
        status: 'sending'
      });

      // Call the AI chat function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageContent,
          characterProfile: characterProfile?.name?.toLowerCase(),
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          provider: 'inference' // Default to inference.net for cost efficiency
        }
      });

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));

      if (error) {
        console.error('AI Chat Error:', error);
        // Fallback to mock response on error
        const fallbackResponse = generateMockResponse(messageContent);
        addMessage({
          content: `${fallbackResponse}\n\n*Note: Using fallback response. AI backend ready but may need API key configuration.*`,
          role: 'assistant',
          timestamp: new Date(),
          status: 'sent'
        });
      } else {
        addMessage({
          content: data.response || data.fallbackResponse || 'I apologize, but I encountered an issue. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
          status: 'sent'
        });
      }

    } catch (error) {
      updateMessageStatus(userMessage.id, 'error');
      
      // Remove typing indicator if it exists
      setMessages(prev => prev.filter(msg => msg.content !== "..."));
      
      // Add fallback response
      const fallbackResponse = generateMockResponse(messageContent);
      addMessage({
        content: `${fallbackResponse}\n\n*Note: Connection error. AI backend is ready but may need API key configuration.*`,
        role: 'assistant',
        timestamp: new Date(),
        status: 'sent'
      });
      
      toast({
        title: "Connection Issue",
        description: "Using fallback response. AI backend is ready for API key setup.",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (userInput: string): string => {
    const responses = [
      `I understand you're asking about "${userInput}". Let me help you with that!`,
      `That's an interesting question about "${userInput}". Here's what I think...`,
      `Thanks for sharing that! Regarding "${userInput}", I'd suggest...`,
      `I see you mentioned "${userInput}". Let me provide you with some helpful information.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: "Voice recording feature coming soon!",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="relative h-[600px] rounded-lg overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${window.innerWidth >= 768 ? webchatDesktopBg : webchatMobileBg})`
      }}
    >
      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Chat container positioned over the phone screen area */}
      <div className="relative h-full flex flex-col md:ml-[20%] md:mr-[20%] md:mt-[15%] md:mb-[15%] md:max-w-[400px] md:mx-auto">
        <Card className="h-full flex flex-col bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={characterProfile?.avatar_url} />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">
                  {characterProfile?.name || "AI Assistant"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {characterProfile?.description || "Ready to help you"}
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-4 p-4">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation!</p>
                    <p className="text-sm">Ask me anything and I'll help you out.</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={characterProfile?.avatar_url} />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </div>
                        {message.status === 'sending' && (
                          <div className="text-xs opacity-70">Sending...</div>
                        )}
                        {message.status === 'error' && (
                          <div className="text-xs text-red-500">Failed</div>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="pr-12"
                />
              </div>
              
              <Button
                size="icon"
                variant="outline"
                onClick={toggleRecording}
                className={isRecording ? "bg-red-50 border-red-200" : ""}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-600" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}