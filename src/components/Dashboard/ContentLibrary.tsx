
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, Filter, Plus, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContentEditor } from "./ContentEditor";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  file_type: string | null;
  file_url: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export function ContentLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content:', error);
        toast.error(`Failed to load content: ${error.message}`);
        return;
      }

      console.log('Fetched content items:', data);
      setContentItems(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while loading content");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setEditorOpen(true);
  };

  const handleSchedule = async (content: ContentItem) => {
    try {
      // Create a scheduled post linked to this media content
      const { data: scheduledPost, error } = await supabase
        .from('scheduled_posts')
        .insert({
          media_content_id: content.id,
          post_description: content.description || `Scheduled post for: ${content.title}`,
          status: 'pending'
          // scheduled_time will be null until user sets it
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating scheduled post:', error);
        toast.error("Failed to create scheduled post");
        return;
      }

      // Navigate to scheduled tab and refresh
      window.history.pushState({}, '', '/dashboard/scheduled');
      window.dispatchEvent(new CustomEvent('refresh-scheduled-content'));
      
      toast.success(`Content "${content.title}" added to Scheduled tab! You can now set the date/time.`);
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('media_content')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        toast.error("Failed to delete content");
        return;
      }

      toast.success("Content deleted successfully!");
      fetchContent();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || item.file_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">📚 Content Library</h2>
          <p className="text-muted-foreground">Manage your reusable content templates and high-performing posts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search content, tags, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="gif">GIFs</SelectItem>
            <SelectItem value="pdf">PDF Documents</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex gap-2">
                      {item.file_type && (
                        <Badge variant="secondary">{item.file_type}</Badge>
                      )}
                      {item.file_size && (
                        <Badge variant="outline">
                          {(item.file_size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleSchedule(item)}
                      title="Schedule this content"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                )}
                
                {item.file_url && (
                  <div className="border rounded-lg p-2">
                    {item.file_type === 'image' && (
                      <img 
                        src={item.file_url} 
                        alt={item.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    {item.file_type === 'video' && (
                      <video 
                        src={item.file_url} 
                        className="w-full h-32 object-cover rounded"
                        controls
                      />
                    )}
                    {item.file_type && !['image', 'video'].includes(item.file_type) && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          {item.file_type.toUpperCase()} File
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ContentEditor 
        content={editingContent}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingContent(null);
        }}
        onSuccess={fetchContent}
      />

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content found matching your criteria.</p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Content
          </Button>
        </div>
      )}
    </div>
  );
}
