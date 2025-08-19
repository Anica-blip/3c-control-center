import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CharacterProfileSettings } from "./CharacterProfileSettings";
import { ErrorLogs } from "./ErrorLogs";

interface SocialPlatform {
  id: string;
  name: string;
  url: string | null;
  is_active: boolean;
}

export function Settings() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformUrl, setNewPlatformUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching platforms:', error);
        toast.error("Failed to load social platforms");
        return;
      }

      console.log('Fetched platforms:', data);
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while loading platforms");
    } finally {
      setLoading(false);
    }
  };

  const addPlatform = async () => {
    if (!newPlatformName.trim()) {
      toast.error("Please enter a platform name");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('social_platforms')
        .insert({
          name: newPlatformName.trim(),
          url: newPlatformUrl.trim() || null,
          is_active: true
        });

      if (error) {
        console.error('Error adding platform:', error);
        toast.error("Failed to add platform");
        return;
      }

      toast.success("Platform added successfully!");
      setNewPlatformName("");
      setNewPlatformUrl("");
      fetchPlatforms();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const togglePlatformStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('social_platforms')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating platform:', error);
        toast.error("Failed to update platform");
        return;
      }

      toast.success("Platform updated successfully!");
      fetchPlatforms();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    }
  };

  const deletePlatform = async (id: string) => {
    if (!confirm("Are you sure you want to delete this platform?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('social_platforms')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting platform:', error);
        toast.error("Failed to delete platform");
        return;
      }

      toast.success("Platform deleted successfully!");
      fetchPlatforms();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">⚙️ Settings</h1>
        <p className="text-muted-foreground">Configure social platforms and character profiles for your content system</p>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Social Platforms</TabsTrigger>
          <TabsTrigger value="character-profiles">Character Profiles</TabsTrigger>
          <TabsTrigger value="error-logs">Error Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Platforms</CardTitle>
              <CardDescription>Manage platforms where your characters can share content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    placeholder="e.g., Instagram, Twitter..."
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-url">Platform URL (optional)</Label>
                  <Input
                    id="platform-url"
                    placeholder="https://..."
                    value={newPlatformUrl}
                    onChange={(e) => setNewPlatformUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addPlatform} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </Button>
                <Button onClick={fetchPlatforms} variant="outline" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading platforms...</p>
                </div>
              )}

              {!loading && platforms.length === 0 && (
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">No social platforms configured yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first platform above.</p>
                </div>
              )}

              {!loading && platforms.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {platforms.map((platform) => (
                        <TableRow key={platform.id}>
                          <TableCell className="font-medium">{platform.name}</TableCell>
                          <TableCell>
                            {platform.url ? (
                              <a 
                                href={platform.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                Visit <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={platform.is_active}
                              onCheckedChange={() => togglePlatformStatus(platform.id, platform.is_active)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deletePlatform(platform.id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="character-profiles" className="space-y-6">
          <CharacterProfileSettings />
        </TabsContent>

        <TabsContent value="error-logs" className="space-y-6">
          <ErrorLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}