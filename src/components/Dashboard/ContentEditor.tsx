import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  file_type: string | null;
  file_url: string | null;
}

interface ContentEditorProps {
  content: ContentItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContentEditor({ content, open, onClose, onSuccess }: ContentEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setDescription(content.description || "");
      setFileType(content.file_type || "");
    } else {
      setTitle("");
      setDescription("");
      setFileType("");
    }
  }, [content]);

  const handleSave = async () => {
    if (!content || !title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('media_content')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          file_type: fileType || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id);

      if (error) {
        console.error('Update error:', error);
        toast.error("Failed to update content");
        return;
      }

      toast.success("Content updated successfully!");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Content Type</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Post Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter the post description... You can add links like: https://example.com"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Add links directly in the text (e.g., https://example.com)
            </p>
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