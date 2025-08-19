
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface SocialPlatform {
  id: string;
  name: string;
  url: string | null;
  is_active: boolean;
}

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onSelectionChange: (platformIds: string[]) => void;
}

export function PlatformSelector({ 
  selectedPlatforms, 
  onSelectionChange
}: PlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  // Debug logging to track selection changes
  useEffect(() => {
    console.log('PlatformSelector - Selected platforms:', selectedPlatforms);
  }, [selectedPlatforms]);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching platforms:', error);
        return;
      }

      console.log('Available platforms:', data);
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handlePlatformToggle = (platformId: string, checked: boolean) => {
    console.log(`Platform ${platformId} toggled to ${checked}`);
    
    if (checked) {
      const newSelection = [...selectedPlatforms, platformId];
      console.log('New platform selection:', newSelection);
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedPlatforms.filter(id => id !== platformId);
      console.log('New platform selection:', newSelection);
      onSelectionChange(newSelection);
    }
  };


  const handleSelectAll = () => {
    if (selectedPlatforms.length === platforms.length) {
      console.log('Deselecting all platforms');
      onSelectionChange([]);
    } else {
      const allPlatformIds = platforms.map(p => p.id);
      console.log('Selecting all platforms:', allPlatformIds);
      onSelectionChange(allPlatformIds);
    }
  };

  if (platforms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Platforms</CardTitle>
          <CardDescription>No active platforms found. Add platforms in Settings.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Social Media Platforms */}
      {platforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Social Media Platforms</CardTitle>
            <CardDescription>Choose social platforms to share this content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedPlatforms.length === platforms.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="font-medium">
                Select All Platforms
              </Label>
            </div>
            
            <div className="grid gap-3 md:grid-cols-2">
              {platforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => handlePlatformToggle(platform.id, !!checked)}
                    />
                    <Label htmlFor={platform.id} className="flex-1">
                      {platform.name}
                      {platform.url && (
                        <span className="text-xs text-muted-foreground block">
                          {platform.url}
                        </span>
                      )}
                    </Label>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">Selected</Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedPlatforms.length > 0 && (
              <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                ✅ {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
