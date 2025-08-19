
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLibrary } from "./ContentLibrary";
import { ContentStats } from "./ContentStats";
import { MediaContentForm } from "./MediaContentForm";

export function ContentManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🎨 Content Manager</h1>
        <p className="text-muted-foreground">Manage Aurion's content library and create new posts</p>
      </div>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Content Library</TabsTrigger>
          <TabsTrigger value="create">Create New Content</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <ContentLibrary />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <MediaContentForm />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ContentStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
