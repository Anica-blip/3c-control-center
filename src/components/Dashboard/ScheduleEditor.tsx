import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlatformSelector } from "./PlatformSelector";

interface ScheduledPost {
  id: string;
  post_description: string | null;
  scheduled_time: string | null;
  status: string | null;
  media_content_id: string | null;
}

interface ScheduleEditorProps {
  post: ScheduledPost | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleEditor({ post, open, onClose, onSuccess }: ScheduleEditorProps) {
  const [description, setDescription] = useState("");
  const [channelGroup, setChannelGroup] = useState("");
  const [threadId, setThreadId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setDescription(post.post_description || "");
      if (post.scheduled_time) {
        const date = new Date(post.scheduled_time);
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().slice(0, 5));
      }
      
      // Fetch selected platforms for this post
      fetchPostPlatforms();
    } else {
      setDescription("");
      setScheduledDate("");
      setScheduledTime("");
      setSelectedPlatforms([]);
    }
  }, [post]);

  const fetchPostPlatforms = async () => {
    if (!post) return;
    
    try {
      const { data, error } = await supabase
        .from('post_platforms')
        .select('platform_id')
        .eq('scheduled_post_id', post.id);

      if (error) {
        console.error('Error fetching post platforms:', error);
        return;
      }

      setSelectedPlatforms(data.map(p => p.platform_id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    if (!post) return;

    if (!scheduledDate || !scheduledTime) {
      toast.error("Please select date and time");
      return;
    }

    setSaving(true);
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      // Update scheduled post
      const { error: updateError } = await supabase
        .from('scheduled_posts')
        .update({
          post_description: description.trim() || null,
          scheduled_time: scheduledDateTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error("Failed to update schedule");
        return;
      }

      // Update platform associations
      // First delete existing ones
      await supabase
        .from('post_platforms')
        .delete()
        .eq('scheduled_post_id', post.id);

      // Then insert new ones
      if (selectedPlatforms.length > 0) {
        const platformData = selectedPlatforms.map(platformId => ({
          scheduled_post_id: post.id,
          platform_id: platformId
        }));

        const { error: platformError } = await supabase
          .from('post_platforms')
          .insert(platformData);

        if (platformError) {
          console.error('Platform error:', platformError);
          toast.error("Failed to update platforms");
          return;
        }
      }

      toast.success("Schedule updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Schedule
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Post Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter the post description... You can add links like: https://example.com"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Add links directly in the text (e.g., https://example.com)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Platforms & Destinations</Label>
            <PlatformSelector 
              selectedPlatforms={selectedPlatforms}
              onSelectionChange={setSelectedPlatforms}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}