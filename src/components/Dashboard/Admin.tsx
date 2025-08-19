import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  LayoutTemplate, 
  ExternalLink, 
  Library, 
  Palette, 
  FileText, 
  Braces,
  Cpu,
  Globe,
  Building
} from "lucide-react";

export function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">⚙️ Admin Center</h1>
        <p className="text-muted-foreground">Manage templates, libraries, and brand assets</p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="libraries">Libraries</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Builder Admin */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-blue-600" />
                  Builder Admin
                </CardTitle>
                <CardDescription>
                  External integration for automated generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded bg-white/50">
                    <div className="flex-1">
                      <span className="font-medium">Content Template Engine</span>
                      <p className="text-xs text-muted-foreground">Comprehensive template creation and management</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://anica-blip.github.io/3c-content-template-engine/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded bg-white/50">
                    <div className="flex-1">
                      <span className="font-medium">Featured Content Templates</span>
                      <p className="text-xs text-muted-foreground">Social Media, Blog, News page, Article</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://anica-blip.github.io/3c-desktop-editor/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded bg-white/50">
                    <div className="flex-1">
                      <span className="font-medium">Content Management</span>
                      <p className="text-xs text-muted-foreground">Content creation with AI & Templates</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://anica-blip.github.io/3c-content-scheduler/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded bg-white/50">
                    <div className="flex-1">
                      <span className="font-medium">SM Content Generator</span>
                      <p className="text-xs text-muted-foreground">Generate social media post content</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://anica-blip.github.io/3c-smpost-generator/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Brand Products */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Braces className="h-5 w-5 text-green-600" />
                  Community Brand Products
                </CardTitle>
                <CardDescription>
                  External app editors for interactive app loaders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Quiz Section */}
                  <div className="p-3 border rounded bg-white/50 border-l-4 border-l-green-400">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <span className="font-medium">Quiz Generator</span>
                        <p className="text-xs text-muted-foreground">3C Interactive Quizzes</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://anica-blip.github.io/3c-quiz-admin/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </a>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-medium text-sm">Quiz Landing Page & App Loader</span>
                        <p className="text-xs text-muted-foreground">Quiz application landing interface</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://anica-blip.github.io/3c-quiz-admin/landing.html?quiz=quiz.01" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded bg-white/50">
                    <div className="flex-1">
                      <span className="font-medium">Game Generator</span>
                      <p className="text-xs text-muted-foreground">Games, puzzles, challenges</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://anica-blip.github.io/3c-game-loader/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* External Integration Receiver */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                External Integration Inbox
              </CardTitle>
              <CardDescription>
                Content received from external builder apps for scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <ExternalLink className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  External apps can send content here using:
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  https://threadcommand.center/dashboard/admin
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Received content will appear here for review and scheduling
                </p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                Configure Integration Endpoint
                <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="libraries" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Wasabi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Wasabi
                </CardTitle>
                <CardDescription>
                  Cloud storage integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Library className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Integration for Wasabi cloud storage
                  </p>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Wasabi
                  <Badge variant="secondary" className="ml-auto">Soon</Badge>
                </Button>
              </CardContent>
            </Card>

            {/* Canva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Canva
                </CardTitle>
                <CardDescription>
                  Design platform integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Direct import from Canva designs
                  </p>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Canva
                  <Badge variant="secondary" className="ml-auto">Soon</Badge>
                </Button>
              </CardContent>
            </Card>

            {/* Notion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notion
                </CardTitle>
                <CardDescription>
                  Content management integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Import content from Notion pages
                  </p>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Notion
                  <Badge variant="secondary" className="ml-auto">Soon</Badge>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brand" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Brand Library */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Brand Library
                </CardTitle>
                <CardDescription>
                  Brand assets and guidelines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Brand Colors</h4>
                    <p className="text-xs text-muted-foreground">Color palette and usage guidelines</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Typography</h4>
                    <p className="text-xs text-muted-foreground">Font styles and hierarchy</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Logo Assets</h4>
                    <p className="text-xs text-muted-foreground">Brand logos and variations</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <Building className="h-4 w-4 mr-2" />
                  Manage Brand Assets
                  <Badge variant="secondary" className="ml-auto">Soon</Badge>
                </Button>
              </CardContent>
            </Card>

            {/* AI Internal Function Kit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  AI Internal Function Kit
                </CardTitle>
                <CardDescription>
                  Internal AI capabilities and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Content Generation</h4>
                    <p className="text-xs text-muted-foreground">AI-powered content creation</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Image Analysis</h4>
                    <p className="text-xs text-muted-foreground">AI image understanding and tagging</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Brand Voice</h4>
                    <p className="text-xs text-muted-foreground">Consistent brand voice training</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <Cpu className="h-4 w-4 mr-2" />
                  Configure AI Tools
                  <Badge variant="secondary" className="ml-auto">Soon</Badge>
                </Button>
              </CardContent>
            </Card>

            {/* AI External Function Kit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  AI External Function Kit
                </CardTitle>
                <CardDescription>
                  External AI service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">OpenAI Integration</h4>
                    <p className="text-xs text-muted-foreground">GPT-powered content generation</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Image Generation</h4>
                    <p className="text-xs text-muted-foreground">AI image creation services</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Translation</h4>
                    <p className="text-xs text-muted-foreground">Multi-language support</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <Globe className="h-4 w-4 mr-2" />
                  Manage External APIs
                  <Badge variant="secondary" className="ml-auto">Soon</Badge>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Dashboard Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Content Manager</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Scheduler Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">External Integrations</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}