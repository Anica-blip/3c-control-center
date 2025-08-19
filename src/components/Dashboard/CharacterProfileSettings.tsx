import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Eye, EyeOff, User, Zap, Bot, Image, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CharacterProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  description: string | null;
  role: string;
  is_active: boolean;
}

export function CharacterProfileSettings() {
  const [profiles, setProfiles] = useState<CharacterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<CharacterProfile | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('character_profiles')
        .select('*')
        .order('role', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = (profile: CharacterProfile) => {
    setEditingProfile(profile);
    setName(profile.name);
    setUsername(profile.username);
    setDescription(profile.description || "");
    setRole(profile.role);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProfile(null);
    setName("");
    setUsername("");
    setDescription("");
    setRole("");
    setAvatarFile(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProfile(null);
    setName("");
    setUsername("");
    setDescription("");
    setRole("");
    setAvatarFile(null);
  };

  const resizeImage = (file: File, maxWidth: number = 200, maxHeight: number = 200, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !username.trim() || !role) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    
    try {
      let avatarUrl = editingProfile?.avatar_url || null;
      
      // Handle avatar upload if a new file is selected
      if (avatarFile) {
        try {
          // Validate file type
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(avatarFile.type)) {
            toast.error("Please upload a valid image file (JPG, PNG, or WebP)");
            setSaving(false);
            return;
          }

          // Validate file size (max 5MB)
          if (avatarFile.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            setSaving(false);
            return;
          }

          // Resize image before upload
          const resizedFile = await resizeImage(avatarFile, 400, 400, 0.8);
          
          // Create unique filename
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `character-avatars/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          console.log('Uploading avatar:', fileName, 'Size:', resizedFile.size);
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media')
            .upload(fileName, resizedFile);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            toast.error(`Upload failed: ${uploadError.message}`);
            setSaving(false);
            return;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(fileName);

          avatarUrl = publicUrl;
          console.log('Avatar uploaded successfully:', avatarUrl);
          
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError);
          toast.error("Failed to upload avatar. Please try again.");
          setSaving(false);
          return;
        }
      }

      // Save profile to database
      const profileData = {
        name: name.trim(),
        username: username.trim(),
        role,
        description: description.trim() || null,
        avatar_url: avatarUrl,
        is_active: true,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      console.log('Saving profile data:', profileData);

      let result;
      if (editingProfile) {
        result = await supabase
          .from('character_profiles')
          .update(profileData)
          .eq('id', editingProfile.id)
          .select();
      } else {
        result = await supabase
          .from('character_profiles')
          .insert([profileData])
          .select();
      }

      if (result.error) {
        console.error('Database error:', result.error);
        toast.error(`Failed to save profile: ${result.error.message}`);
        setSaving(false);
        return;
      }

      console.log('Profile saved successfully:', result.data);
      toast.success(editingProfile ? "Profile updated successfully!" : "Profile created successfully!");
      
      // Reset form and refresh data
      handleCancel();
      fetchProfiles();
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (profile: CharacterProfile) => {
    try {
      const { error } = await supabase
        .from('character_profiles')
        .update({ is_active: !profile.is_active })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success(`Profile ${profile.is_active ? 'deactivated' : 'activated'}`);
      fetchProfiles();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred");
    }
  };

  const handleDownloadAvatar = async (profile: CharacterProfile) => {
    if (!profile.avatar_url) {
      toast.error("No avatar image to download");
      return;
    }

    try {
      const response = await fetch(profile.avatar_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.name.toLowerCase()}-avatar.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${profile.name}'s avatar`);
    } catch (error) {
      console.error('Error downloading avatar:', error);
      toast.error("Failed to download avatar");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <User className="h-4 w-4" />;
      case '3C Manager': return <Zap className="h-4 w-4" />;
      case '3C Mascot': return <Bot className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner': return <Badge variant="default">Owner</Badge>;
      case '3C Manager': return <Badge variant="secondary">3C Manager</Badge>;
      case '3C Mascot': return <Badge variant="outline">3C Mascot</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return <div>Loading character profiles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Character Profiles</h2>
          <p className="text-muted-foreground">
            Manage the character profiles that can post content (Anica, Caelum, Aurion)
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Character Profile
        </Button>
      </div>

      {/* Character Profiles List */}
      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className={`${!profile.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url || ""} alt={profile.name} />
                    <AvatarFallback className="flex items-center justify-center">
                      {getRoleIcon(profile.role)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{profile.name}</span>
                      {getRoleBadge(profile.role)}
                      {!profile.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.username}
                    </div>
                    {profile.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {profile.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.avatar_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAvatar(profile)}
                      title="Download avatar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProfile(profile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={profile.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(profile)}
                  >
                    {profile.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProfile ? 'Edit Character Profile' : 'Add New Character Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Name *</Label>
                  <Input
                    id="profile-name"
                    placeholder="e.g., Anica"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-username">Username *</Label>
                  <Input
                    id="profile-username"
                    placeholder="e.g., @anica"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-role">Role *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="3C Manager">3C Manager</SelectItem>
                    <SelectItem value="3C Mascot">3C Mascot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-description">Description</Label>
                <Textarea
                  id="profile-description"
                  placeholder="Brief description of this character's role..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-avatar">Avatar Image</Label>
                  <Input
                    id="profile-avatar"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload JPG, PNG or WebP image. Max 5MB. Will be resized to 200x200px for profile picture.
                  </p>
                  {editingProfile?.avatar_url && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Image className="h-4 w-4" />
                      <span>Current avatar will be replaced if new file is uploaded</span>
                    </div>
                  )}
                </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingProfile ? "Update Profile" : "Create Profile"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}