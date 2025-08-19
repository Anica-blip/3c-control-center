import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Plus, Edit, Trash2, Play, Pause, RotateCcw, X, ExternalLink, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlatformSelector } from "./PlatformSelector";
import { ScheduleEditor } from "./ScheduleEditor";
import { CharacterProfileSelector } from "./CharacterProfileSelector";
import { PostPlatformDisplay } from "./PostPlatformDisplay";

interface ScheduledPost {
  id: string;
  post_description: string | null;
  scheduled_time: string | null;
  status: string | null;
  media_content_id: string | null;
  character_profile_id: string | null;
  error_message?: string | null;
  media_content?: {
    title: string;
    file_type: string | null;
  };
  character_profiles?: {
    name: string;
    username: string;
    avatar_url: string | null;
  };
}

export function ScheduledContent() {
  const [selectedView, setSelectedView] = useState("calendar");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostDescription, setNewPostDescription] = useState("");
  const [newPostDate, setNewPostDate] = useState("");
  const [newPostTime, setNewPostTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCharacterProfile, setSelectedCharacterProfile] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchScheduledPosts();
    
    // Listen for refresh events from content manager
    const handleRefreshScheduled = () => {
      fetchScheduledPosts();
    };

    // Listen for content forwarding from library (existing functionality)
    const handleScheduleContent = (event: CustomEvent) => {
      const { mediaContentId, title, description } = event.detail;
      setNewPostDescription(description || `Scheduled post for: ${title}`);
      setShowCreateForm(true);
      // Set a default date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setNewPostDate(tomorrow.toISOString().split('T')[0]);
      setNewPostTime('09:00');
      toast.success(`Content "${title}" ready for scheduling!`);
    };

    window.addEventListener('refresh-scheduled-content' as any, handleRefreshScheduled);
    window.addEventListener('schedule-content' as any, handleScheduleContent);
    
    return () => {
      window.removeEventListener('refresh-scheduled-content' as any, handleRefreshScheduled);
      window.removeEventListener('schedule-content' as any, handleScheduleContent);
    };
  }, []);

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          media_content (
            title,
            file_type,
            file_url
          ),
          character_profiles (
            name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scheduled posts:', error);
        toast.error(`Failed to load scheduled posts: ${error.message}`);
        return;
      }

      console.log('Fetched scheduled posts:', data);
      
      // Log posts with issues for debugging
      const problematicPosts = data?.filter(post => 
        !post.character_profiles || 
        !post.media_content ||
        post.status === 'failed'
      ) || [];
      
      if (problematicPosts.length > 0) {
        console.warn('Posts with potential issues:', problematicPosts);
      }
      
      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while loading scheduled posts");
    } finally {
      setLoading(false);
    }
  };

  // Get next 7 days for calendar view
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const groupPostsByDate = () => {
    const grouped: { [key: string]: ScheduledPost[] } = {};
    scheduledPosts.forEach(post => {
      if (post.scheduled_time) {
        const date = new Date(post.scheduled_time).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(post);
      }
    });
    return grouped;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily_affirmation": return "default";
      case "motivational_quote": return "secondary";
      case "mindset_challenge": return "outline";
      case "video_caption": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "sent": return "default";
      case "paused": return "outline";
      case "failed": return "destructive";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    // Convert to Portugal time (Europe/Lisbon)
    const portugalDate = new Date(date.toLocaleString("en-US", {timeZone: "Europe/Lisbon"}));
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();
    
    if (portugalDate.toDateString() === today) return "Today";
    if (portugalDate.toDateString() === tomorrow) return "Tomorrow";
    
    return portugalDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Europe/Lisbon'
    });
  };

  const getTotalScheduledCount = () => {
    return scheduledPosts.filter(post => post.status === "pending").length;
  };

  const getTodayCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return scheduledPosts.filter(post => 
      post.scheduled_time && 
      new Date(post.scheduled_time).toISOString().split('T')[0] === today &&
      post.status === "sent"
    ).length;
  };

  const handleEdit = (post: ScheduledPost) => {
    setEditingPost(post);
    setEditorOpen(true);
  };

  const handleCancelPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', postId);

      if (error) {
        console.error('Cancel error:', error);
        toast.error("Failed to cancel post");
        return;
      }

      toast.success("Post cancelled successfully!");
      fetchScheduledPosts();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Delete error:', error);
        toast.error("Failed to delete post");
        return;
      }

      toast.success("Post deleted successfully!");
      fetchScheduledPosts();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    }
  };

  const handleCreatePost = async () => {
    if (!newPostDescription.trim() || !newPostDate || !newPostTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    if (!selectedCharacterProfile) {
      toast.error("Please select a character profile");
      return;
    }

    setSaving(true);
    try {
      const scheduledDateTime = new Date(`${newPostDate}T${newPostTime}`).toISOString();

      console.log('Creating post with:', {
        description: newPostDescription.trim(),
        scheduledDateTime,
        characterProfile: selectedCharacterProfile,
        platforms: selectedPlatforms
      });

      const { data: postData, error: postError } = await supabase
        .from('scheduled_posts')
        .insert({
          post_description: newPostDescription.trim(),
          scheduled_time: scheduledDateTime,
          character_profile_id: selectedCharacterProfile,
          status: 'pending'
        })
        .select()
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        toast.error(`Failed to create post: ${postError.message}`);
        return;
      }

      console.log('Created post:', postData);

      // Add platform associations ONLY if platforms are selected
      if (selectedPlatforms.length > 0) {
        const platformData = selectedPlatforms.map(platformId => ({
          scheduled_post_id: postData.id,
          platform_id: platformId
        }));

        console.log('Adding platform associations:', platformData);

        const { error: platformError } = await supabase
          .from('post_platforms')
          .insert(platformData);

        if (platformError) {
          console.error('Platform error:', platformError);
          toast.error(`Failed to associate platforms: ${platformError.message}`);
          return;
        }
      }

      toast.success("Post scheduled successfully!");
      setNewPostDescription("");
      setNewPostDate("");
      setNewPostTime("");
      setSelectedPlatforms([]);
      setSelectedCharacterProfile(null);
      setShowCreateForm(false);
      fetchScheduledPosts();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while creating the post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📅 Content Scheduler</h1>
        <p className="text-muted-foreground">Manage your bot's scheduled content delivery and timing</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedView("list")}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{getTotalScheduledCount()}</p>
                <p className="text-xs text-muted-foreground">Pending Posts</p>
                {getTotalScheduledCount() > 0 && (
                  <p className="text-xs text-blue-600 mt-1">Click to view details</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{getTodayCount()}</p>
                <p className="text-xs text-muted-foreground">Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">Active</p>
                <p className="text-xs text-muted-foreground">Scheduler Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Auto-Recurring</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="timeline">Timeline View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchScheduledPosts()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh Posts
          </Button>
          <Button variant="outline">
            <Pause className="h-4 w-4 mr-2" />
            Pause All
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Content
          </Button>
        </div>
      </div>

      {/* Create New Post Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Content</CardTitle>
            <CardDescription>Create a new scheduled post for Aurion to share</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-description">Post Description</Label>
              <div className="relative">
                <Textarea
                  id="new-description"
                  value={newPostDescription}
                  onChange={(e) => setNewPostDescription(e.target.value)}
                  placeholder="Enter the post description..."
                  rows={3}
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
                          setNewPostDescription(prev => prev + ` [${text}](${url})`);
                        } else {
                          setNewPostDescription(prev => prev + ` ${url}`);
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-date">Date</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newPostDate}
                  onChange={(e) => setNewPostDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-time">Time</Label>
                <Input
                  id="new-time"
                  type="time"
                  value={newPostTime}
                  onChange={(e) => setNewPostTime(e.target.value)}
                />
              </div>
            </div>

            <CharacterProfileSelector
              selectedProfileId={selectedCharacterProfile}
              onSelectionChange={setSelectedCharacterProfile}
            />

            <div className="space-y-2">
              <Label>Select Platforms</Label>
              <PlatformSelector 
                selectedPlatforms={selectedPlatforms}
                onSelectionChange={setSelectedPlatforms}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreatePost} disabled={saving}>
                {saving ? "Creating..." : "Schedule Post"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {selectedView === "calendar" && !showCreateForm && (
        <div className="space-y-4">
          {/* Show unscheduled posts prominently */}
          {scheduledPosts.filter(post => !post.scheduled_time).length > 0 && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  📝 Content Ready for Scheduling ({scheduledPosts.filter(post => !post.scheduled_time).length})
                </CardTitle>
                <CardDescription className="text-orange-600">
                  These posts were created in Content Manager and need scheduling times. Click "Schedule" to set a time.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {scheduledPosts
                    .filter(post => !post.scheduled_time)
                    .map((post) => (
                      <div key={post.id} className="p-3 bg-white rounded-lg border flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-orange-600">
                              Needs Scheduling
                            </Badge>
                            {post.media_content?.file_type && (
                              <Badge variant="secondary">
                                {post.media_content.file_type}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm">
                            {post.media_content?.title || "Text Post"}
                          </h4>
                            {post.post_description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {post.post_description}
                              </p>
                            )}
                            <div className="mt-2">
                              <PostPlatformDisplay postId={post.id} compact />
                            </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(post)}
                          className="ml-2"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <h2 className="text-xl font-semibold">Upcoming 7 Days</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading scheduled content...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getNext7Days().map((date) => {
                const dayContent = groupPostsByDate()[date] || [];
                return (
                  <Card key={date} className="min-h-48">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{formatDate(date)}</CardTitle>
                        <Badge variant="outline">{dayContent.length} posts</Badge>
                      </div>
                      <CardDescription>{date}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dayContent.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No content scheduled</p>
                      ) : (
                        dayContent.map((post) => (
                          <div key={post.id} className="p-3 border rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusColor(post.status || "")} className="text-xs">
                                  {post.status}
                                </Badge>
                                {post.media_content?.file_type && (
                                  <Badge variant="secondary" className="text-xs">
                                    {post.media_content.file_type}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {post.scheduled_time && new Date(post.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                            
                            {/* Character Profile Display */}
                            {post.character_profiles && (
                              <div className="flex items-center gap-2 py-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={post.character_profiles.avatar_url || ""} alt={post.character_profiles.name} />
                                  <AvatarFallback className="text-xs">
                                    <User className="h-3 w-3" />
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-muted-foreground">
                                  {post.character_profiles.username}
                                </span>
                              </div>
                            )}
                            
                            <h4 className="font-medium text-sm">
                              {post.media_content?.title || "Text Post"}
                            </h4>
                            {post.post_description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{post.post_description}</p>
                            )}
                            <div className="mt-1">
                              <PostPlatformDisplay postId={post.id} compact />
                            </div>
                            <div className="flex justify-end">
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEdit(post)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleCancelPost(post.id)}
                                  title="Cancel post"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Month View */}
      {selectedView === "month" && !showCreateForm && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Month Overview</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading scheduled content...</p>
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-7">
              {/* Month calendar implementation */}
              {Array.from({ length: 35 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + i);
                const dateStr = date.toISOString().split('T')[0];
                const dayContent = groupPostsByDate()[dateStr] || [];
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                
                return (
                  <Card key={i} className={`h-24 ${isToday ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-2">
                      <div className="text-xs font-medium">{date.getDate()}</div>
                      <div className="text-xs text-muted-foreground">
                        {dayContent.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {dayContent.length}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {selectedView === "timeline" && !showCreateForm && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Content Timeline</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading scheduled content...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupPostsByDate())
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([date, posts]) => (
                  <Card key={date}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {formatDate(date)} - {date}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {posts.map((post) => (
                          <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusColor(post.status || "")}>
                                  {post.status}
                                </Badge>
                                {post.media_content?.file_type && (
                                  <Badge variant="secondary">
                                    {post.media_content.file_type}
                                  </Badge>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {post.scheduled_time && new Date(post.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <h4 className="font-medium">
                                {post.media_content?.title || "Text Post"}
                              </h4>
                              {post.post_description && (
                                <p className="text-sm text-muted-foreground">{post.post_description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(post)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCancelPost(post.id)}
                                title="Cancel post"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {selectedView === "list" && !showCreateForm && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Scheduled Content</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading scheduled content...</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {scheduledPosts.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No content found. Create content in the Content Manager tab first.
                    </div>
                  ) : (
                    <>
                      {/* Show unscheduled posts first */}
                      {scheduledPosts.filter(post => !post.scheduled_time).length > 0 && (
                        <div className="p-4 bg-orange-50/50 border-b">
                          <h3 className="font-semibold text-orange-800 mb-2">
                            📝 Content Ready for Scheduling ({scheduledPosts.filter(post => !post.scheduled_time).length})
                          </h3>
                          <p className="text-sm text-orange-600">
                            These posts were created in Content Manager and need scheduling times.
                          </p>
                        </div>
                      )}
                      
                      {/* Show posts with errors prominently */}
                      {scheduledPosts.filter(post => post.status === 'failed').length > 0 && (
                        <div className="p-4 bg-red-50/50 border-b">
                          <h3 className="font-semibold text-red-800 mb-2">
                            ❌ Failed Posts ({scheduledPosts.filter(post => post.status === 'failed').length})
                          </h3>
                          <p className="text-sm text-red-600">
                            These posts failed to send. Check the error details and retry.
                          </p>
                        </div>
                      )}
                      
                      {[...scheduledPosts]
                        .sort((a, b) => {
                          // Show failed posts first, then unscheduled, then by scheduled time
                          if (a.status === 'failed' && b.status !== 'failed') return -1;
                          if (b.status === 'failed' && a.status !== 'failed') return 1;
                          if (!a.scheduled_time && !b.scheduled_time) return 0;
                          if (!a.scheduled_time) return -1;
                          if (!b.scheduled_time) return 1;
                          return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
                        })
                         .map((post) => (
                          <div key={post.id} className={`p-4 flex items-center justify-between ${
                            post.status === 'failed' ? 'bg-red-50/30' : ''
                          }`}>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusColor(post.status || "")}>
                                  {post.status}
                                </Badge>
                                {post.media_content?.file_type && (
                                  <Badge variant="secondary">
                                    {post.media_content.file_type}
                                  </Badge>
                                )}
                                {!post.scheduled_time ? (
                                  <Badge variant="outline" className="text-orange-600">
                                    Needs Scheduling
                                  </Badge>
                                ) : (
                                  <>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(post.scheduled_time).toLocaleDateString()}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(post.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Character Profile Display */}
                              {post.character_profiles ? (
                                <div className="flex items-center gap-2 py-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={post.character_profiles.avatar_url || ""} alt={post.character_profiles.name} />
                                    <AvatarFallback className="text-xs">
                                      <User className="h-3 w-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {post.character_profiles.username}
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  Missing Character Profile
                                </Badge>
                              )}
                              
                              <h4 className="font-medium">
                                {post.media_content?.title || "Text Post"}
                              </h4>
                              {post.post_description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{post.post_description}</p>
                              )}
                              
                              {/* Error message display */}
                              {post.status === 'failed' && post.error_message && (
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                                  Error: {post.error_message}
                                </div>
                              )}
                              
                              {/* Platform selection display */}
                              <div className="mt-2">
                                <PostPlatformDisplay postId={post.id} compact />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(post)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCancelPost(post.id)}
                                title="Cancel post"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      }
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Schedule Actions</CardTitle>
          <CardDescription>Common scheduling templates and bulk actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Morning Motivation</div>
                <div className="text-xs text-muted-foreground">Daily at 8:00 AM</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Midday Check-in</div>
                <div className="text-xs text-muted-foreground">Daily at 12:00 PM</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Evening Reflection</div>
                <div className="text-xs text-muted-foreground">Daily at 6:00 PM</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Weekly Challenge</div>
                <div className="text-xs text-muted-foreground">Mondays at 9:00 AM</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ScheduleEditor 
        post={editingPost}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingPost(null);
        }}
        onSuccess={fetchScheduledPosts}
      />
    </div>
  );
}
