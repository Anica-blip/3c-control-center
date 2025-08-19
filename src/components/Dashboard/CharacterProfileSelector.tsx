import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { User, Bot, Zap } from "lucide-react";

interface CharacterProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  description: string | null;
  role: string;
  is_active: boolean;
}

interface CharacterProfileSelectorProps {
  selectedProfileId: string | null;
  onSelectionChange: (profileId: string | null) => void;
}

export function CharacterProfileSelector({ selectedProfileId, onSelectionChange }: CharacterProfileSelectorProps) {
  const [profiles, setProfiles] = useState<CharacterProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('character_profiles')
        .select('*')
        .eq('is_active', true)
        .order('role', { ascending: true });

      if (error) {
        console.error('Error fetching character profiles:', error);
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'border-primary bg-primary/5';
      case '3C Manager': return 'border-blue-500 bg-blue-50';
      case '3C Mascot': return 'border-green-500 bg-green-50';
      default: return 'border-muted';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Character Profile</CardTitle>
          <CardDescription>Loading profiles...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Character Profile</CardTitle>
          <CardDescription>No character profiles found. Add profiles in Settings.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Character Profile</CardTitle>
        <CardDescription>Choose who will be posting this content</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedProfileId || ""} onValueChange={onSelectionChange}>
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div key={profile.id} className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getRoleColor(profile.role)} ${selectedProfileId === profile.id ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={profile.id} id={profile.id} className="mt-1" />
                  <Label htmlFor={profile.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile.avatar_url || ""} alt={profile.name} />
                        <AvatarFallback className="flex items-center justify-center">
                          {getRoleIcon(profile.role)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{profile.name}</span>
                          {getRoleBadge(profile.role)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {profile.username}
                        </div>
                        {profile.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {profile.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
        
        {selectedProfileId && (
          <div className="mt-3 text-sm text-muted-foreground">
            Selected: {profiles.find(p => p.id === selectedProfileId)?.name}
          </div>
        )}
      </CardContent>
    </Card>
  );
}