
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Platform {
  id: string;
  name: string;
  url: string | null;
}


interface PostPlatformDisplayProps {
  postId: string;
  compact?: boolean;
}

export function PostPlatformDisplay({ postId, compact = false }: PostPlatformDisplayProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformSelections();
  }, [postId]);

  const fetchPlatformSelections = async () => {
    setLoading(true);
    try {
      // Get ONLY the platform associations for this specific post
      const { data: postPlatforms, error: platformError } = await supabase
        .from('post_platforms')
        .select(`
          platform_id,
          social_platforms (
            id,
            name,
            url
          )
        `)
        .eq('scheduled_post_id', postId);

      if (platformError) {
        console.error('Error fetching post platforms:', platformError);
        setPlatforms([]);
      } else {
        const platformData = postPlatforms?.map(pp => pp.social_platforms).filter(Boolean) || [];
        setPlatforms(platformData as Platform[]);
        console.log(`Post ${postId} has ${platformData.length} selected platforms:`, platformData);
      }

      
    } catch (error) {
      console.error('Error fetching platform selections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Badge variant="outline" className="text-xs">Loading...</Badge>;
  }

  const totalDestinations = platforms.length;

  if (totalDestinations === 0) {
    return (
      <Badge variant="outline" className="text-xs text-orange-600">
        No platforms selected
      </Badge>
    );
  }

  if (compact) {
    return (
      <Badge variant="secondary" className="text-xs">
        {totalDestinations} destination{totalDestinations !== 1 ? 's' : ''}
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((platform) => (
        <Badge key={platform.id} variant="default" className="text-xs">
          {platform.name}
        </Badge>
      ))}
    </div>
  );
}
