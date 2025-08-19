
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Image, Video, FileImage, ExternalLink, Palette, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CharacterProfileSelector } from "./CharacterProfileSelector";
import { PlatformSelector } from "./PlatformSelector";

export function MediaContentForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedCharacterProfile, setSelectedCharacterProfile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [interactiveUrl, setInteractiveUrl] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [channelGroup, setChannelGroup] = useState("");
  const [threadId, setThreadId] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-detect file type
      const type = selectedFile.type;
      if (type.startsWith('image/')) {
        if (type === 'image/gif') {
          setFileType('gif');
        } else {
          setFileType('image');
        }
      } else if (type.startsWith('video/')) {
        setFileType('video');
      } else if (type === 'application/pdf') {
        setFileType('pdf');
      } else {
        setFileType('other');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setUploading(true);
    try {
      let fileUrl = null;
      let fileSize = null;
      let finalFileType = fileType;

      // For interactive content, use the URL instead of file upload
      if (fileType === 'interactive' && interactiveUrl.trim()) {
        fileUrl = interactiveUrl.trim();
        finalFileType = 'interactive';
      }

      // Upload file if selected (skip for interactive content)
      if (file && fileType !== 'interactive') {
        try {
          // Check if media bucket exists
          const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
          
          if (bucketError) {
            console.error('Bucket check error:', bucketError);
            toast.error("Storage not available, saving content without file...");
          } else {
            const mediaBucket = buckets?.find(bucket => bucket.id === 'media');
            if (!mediaBucket) {
              console.error('Media bucket not found');
              toast.error("Media storage not configured, saving content without file...");
            } else {
              const fileExt = file.name.split('.').pop();
              const fileName = `${Math.random()}.${fileExt}`;
              
              const { error: uploadError } = await supabase.storage
                .from('media')
                .upload(fileName, file);

              if (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error(`Failed to upload file: ${uploadError.message}. Saving content without file...`);
              } else {
                const { data } = supabase.storage.from('media').getPublicUrl(fileName);
                fileUrl = data.publicUrl;
                fileSize = file.size;
                toast.success("File uploaded successfully!");
              }
            }
          }
        } catch (error) {
          console.error('File upload error:', error);
          toast.error("Failed to upload file. Saving content without file...");
        }
      }

      // Insert media content record
      const { error } = await supabase
        .from('media_content')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          file_url: fileUrl,
          file_type: finalFileType || null,
          file_size: fileSize,
          character_profile_id: selectedCharacterProfile
        });

      if (error) {
        console.error('Database error:', error);
        toast.error("Failed to save content");
        return;
      }

      toast.success("Media content created successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setFileType("");
      setFile(null);
      setSelectedCharacterProfile(null);
      setInteractiveUrl("");
      setSelectedPlatforms([]);
      setChannelGroup("");
      setThreadId("");
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'gif': return <FileImage className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'interactive': return <Globe className="h-4 w-4" />;
      default: return <FileImage className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Add Media Content
        </CardTitle>
        <CardDescription>
          Upload images, videos, documents, and other media files for Aurion to share
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter content title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <CharacterProfileSelector
            selectedProfileId={selectedCharacterProfile}
            onSelectionChange={setSelectedCharacterProfile}
          />

          <div className="space-y-4">
            {fileType !== 'interactive' ? (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,video/*,.pdf,.gif,.doc,.docx,.txt"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getFileTypeIcon(fileType)}
                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="interactive-url">Interactive Content URL</Label>
                <Input
                  id="interactive-url"
                  type="url"
                  placeholder="https://example.com/interactive-content"
                  value={interactiveUrl}
                  onChange={(e) => setInteractiveUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL for interactive content like quizzes, games, or embeddable widgets
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                disabled
              >
                <Palette className="h-4 w-4" />
                Import from Canva
                <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                disabled
              >
                <FileText className="h-4 w-4" />
                Import from Notion
                <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-type">Content Type</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
               <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="interactive">Interactive Post</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Post Description</Label>
            <div className="relative">
              <Textarea
                id="description"
                placeholder="Enter the post description that will accompany this content..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="absolute bottom-2 right-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Add link"
                  onClick={() => {
                    const url = prompt("Enter link URL:");
                    if (url) {
                      const text = prompt("Enter link text:");
                      if (text) {
                        setDescription(prev => prev + ` [${text}](${url})`);
                      } else {
                        setDescription(prev => prev + ` ${url}`);
                      }
                    }
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Click the link icon to add links, or use markdown format: [text](url)
            </p>
          </div>

          <div className="space-y-4">
            <PlatformSelector 
              selectedPlatforms={selectedPlatforms}
              onSelectionChange={setSelectedPlatforms}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channel-group">Telegram Channel/Group ID</Label>
                <Input
                  id="channel-group"
                  placeholder="e.g., @yourchannel or -1001234567890"
                  value={channelGroup}
                  onChange={(e) => setChannelGroup(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Telegram channel or group ID for forwarding
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thread-id">Thread ID</Label>
                <Input
                  id="thread-id"
                  placeholder="e.g., 123"
                  value={threadId}
                  onChange={(e) => setThreadId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Specific thread ID within the channel/group
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? "Creating..." : "Create Media Content"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={uploading || !title.trim()}
              onClick={async () => {
                if (!title.trim()) {
                  toast.error("Please enter a title first");
                  return;
                }
                
                setUploading(true);
                try {
                  // First create the media content
                  let fileUrl = null;
                  let fileSize = null;
                  let finalFileType = fileType;

                  // For interactive content, use the URL instead of file upload
                  if (fileType === 'interactive' && interactiveUrl.trim()) {
                    fileUrl = interactiveUrl.trim();
                    finalFileType = 'interactive';
                  } else if (file) {
                    // Upload file if selected (skip for interactive content)
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    
                    const { error: uploadError } = await supabase.storage
                      .from('media')
                      .upload(fileName, file);

                    if (!uploadError) {
                      const { data } = supabase.storage.from('media').getPublicUrl(fileName);
                      fileUrl = data.publicUrl;
                      fileSize = file.size;
                    }
                  }

                  // Create media content record
                  const { data: mediaData, error: mediaError } = await supabase
                    .from('media_content')
                    .insert({
                      title: title.trim(),
                      description: description.trim() || null,
                      file_url: fileUrl,
                      file_type: finalFileType || null,
                      file_size: fileSize,
                      character_profile_id: selectedCharacterProfile
                    })
                    .select()
                    .single();

                  if (mediaError) {
                    console.error('Database error:', mediaError);
                    toast.error("Failed to save content");
                    return;
                  }

                  // Create a scheduled post draft linked to the media content
                  const { data: scheduledPostData, error: scheduleError } = await supabase
                    .from('scheduled_posts')
                    .insert({
                      media_content_id: mediaData.id,
                      post_description: description.trim() || `Scheduled post for: ${title.trim()}`,
                      character_profile_id: selectedCharacterProfile,
                      status: 'pending',
                      channel_group: channelGroup.trim() || null,
                      thread_id: threadId.trim() || null
                      // scheduled_time will be null until user sets it
                    })
                    .select()
                    .single();

                  if (scheduleError) {
                    console.error('Schedule error:', scheduleError);
                    toast.error("Failed to create scheduled post");
                    return;
                  }

                  // Add platform associations if platforms are selected
                  if (selectedPlatforms.length > 0) {
                    const platformData = selectedPlatforms.map(platformId => ({
                      scheduled_post_id: scheduledPostData.id,
                      platform_id: platformId
                    }));

                    const { error: platformError } = await supabase
                      .from('post_platforms')
                      .insert(platformData);

                    if (platformError) {
                      console.error('Platform error:', platformError);
                      toast.error("Failed to associate platforms");
                      return;
                    }
                  }

                  toast.success("Content created and ready for scheduling!");
                  
                  // Reset form
                  setTitle("");
                  setDescription("");
                  setFileType("");
                  setFile(null);
                  setSelectedCharacterProfile(null);
                  setInteractiveUrl("");
                  setSelectedPlatforms([]);
                  setChannelGroup("");
                  setThreadId("");
                  
                  // Reset file input
                  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';

                  // Navigate to scheduled tab
                  window.history.pushState({}, '', '/dashboard/scheduled');
                  
                  // Dispatch event to refresh scheduled content
                  window.dispatchEvent(new CustomEvent('refresh-scheduled-content'));
                  
                } catch (error) {
                  console.error('Error:', error);
                  toast.error("An error occurred");
                } finally {
                  setUploading(false);
                }
              }}
            >
              Schedule This Content
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
