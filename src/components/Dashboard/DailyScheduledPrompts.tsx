import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Edit, Trash2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DailyPrompt {
  id: string;
  content: string;
  frequency: string | null;
  scheduled_at: string | null;
  group: string | null;
  thread_id: string | null;
  title: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
}

export const DailyScheduledPrompts = () => {
  const [prompts, setPrompts] = useState<DailyPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [frequency, setFrequency] = useState("");
  const [group, setGroup] = useState("");
  const [threadId, setThreadId] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_schedule_prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error("Failed to fetch scheduled prompts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async () => {
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      const scheduledDateTime = scheduledDate && scheduledTime 
        ? `${scheduledDate}T${scheduledTime}:00.000Z`
        : null;

      const { error } = await supabase
        .from('daily_schedule_prompts')
        .insert({
          title: title.trim() || null,
          content: content.trim(),
          frequency: frequency || null,
          group: group.trim() || null,
          thread_id: threadId.trim() || null,
          notes: notes.trim() || null,
          scheduled_at: scheduledDateTime,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Scheduled prompt created successfully");
      
      // Reset form
      setTitle("");
      setContent("");
      setFrequency("");
      setGroup("");
      setThreadId("");
      setNotes("");
      setScheduledDate("");
      setScheduledTime("");
      setIsCreating(false);
      
      // Refresh list
      fetchPrompts();
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast.error("Failed to create scheduled prompt");
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('daily_schedule_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Prompt deleted successfully");
      fetchPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error("Failed to delete prompt");
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading scheduled prompts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Scheduled Prompts</h2>
          <p className="text-muted-foreground">
            Create and manage prompts that will be sent to your Telegram groups
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          Add Prompt
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Scheduled Prompt</CardTitle>
            <CardDescription>
              This will be sent to your Telegram bot via your existing GitHub setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Prompt title (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="once">Once</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the message content that will be sent to Telegram"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group">Group/Channel ID</Label>
                <Input
                  id="group"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="Telegram group or channel ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threadId">Thread ID</Label>
                <Input
                  id="threadId"
                  value={threadId}
                  onChange={(e) => setThreadId(e.target.value)}
                  placeholder="Thread ID (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Scheduled Time</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreatePrompt}>
                <Send className="mr-2 h-4 w-4" />
                Create Prompt
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompts List */}
      <div className="grid gap-4">
        {prompts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No scheduled prompts yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {prompt.title && (
                        <h3 className="font-semibold">{prompt.title}</h3>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prompt.status)}`}>
                        {prompt.status || 'pending'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{prompt.content}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {prompt.frequency && (
                        <span>Frequency: {prompt.frequency}</span>
                      )}
                      {prompt.group && (
                        <span>Group: {prompt.group}</span>
                      )}
                      {prompt.thread_id && (
                        <span>Thread: {prompt.thread_id}</span>
                      )}
                      {prompt.scheduled_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(prompt.scheduled_at).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {prompt.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        Notes: {prompt.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};