
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Brain, Users, Search, Map, TrendingUp, FileText, Send, ExternalLink, Archive, Upload, Bot, Lightbulb } from 'lucide-react';

export function CaelumControlCenter() {
  const [selectedPersona, setSelectedPersona] = useState('');
  const [activeTab, setActiveTab] = useState('personas');

  // Mock data - will be replaced with Supabase data
  const personas = [
    { id: '1', name: 'Tech Entrepreneur', age: '25-35', bio: 'Early-stage startup founder', goals: 'Scale business', pains: 'Limited resources', stage: 'Awareness' },
    { id: '2', name: 'Digital Nomad', age: '28-40', bio: 'Remote worker seeking freedom', goals: 'Location independence', pains: 'Inconsistent income', stage: 'Consideration' }
  ];

  const keywords = [
    { id: '1', keyword: 'startup funding', volume: '12000', intent: 'Informational', cluster: 'Business', source: 'Manual', personaId: '1' },
    { id: '2', keyword: 'remote work tools', volume: '8500', intent: 'Transactional', cluster: 'Productivity', source: 'GSC', personaId: '2' }
  ];

  const channels = [
    { id: '1', platform: 'Reddit', link: 'r/entrepreneur', topic: 'Business', priority: 9, personaId: '1' },
    { id: '2', platform: 'YouTube', link: 'Nomad Summit', topic: 'Lifestyle', priority: 8, personaId: '2' }
  ];

  const trendData = [
    { month: 'Jan', searches: 1200 },
    { month: 'Feb', searches: 1350 },
    { month: 'Mar', searches: 1100 },
    { month: 'Apr', searches: 1500 }
  ];

  const intentData = [
    { name: 'Informational', value: 45, color: '#0088FE' },
    { name: 'Navigational', value: 25, color: '#00C49F' },
    { name: 'Transactional', value: 30, color: '#FFBB28' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Caelum's Control Center</h1>
          <p className="text-muted-foreground">Persona-driven research hub to power Aurion's strategic content systems</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full">
          <TabsTrigger value="personas" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Personas
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-1">
            <Map className="h-4 w-4" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="vault" className="flex items-center gap-1">
            <Bot className="h-4 w-4" />
            Aurion Vault
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1">
            <ExternalLink className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="sparktoro" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            SparkToro
          </TabsTrigger>
          <TabsTrigger value="anica" className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            Anica Intel
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-1">
            <Archive className="h-4 w-4" />
            Archives
          </TabsTrigger>
        </TabsList>

        {/* Persona Manager */}
        <TabsContent value="personas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Persona Manager</CardTitle>
              <CardDescription>Manage target personas and their characteristics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="persona-name">Name</Label>
                    <Input id="persona-name" placeholder="Persona name" />
                  </div>
                  <div>
                    <Label htmlFor="persona-age">Age/Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18-25">18-25</SelectItem>
                        <SelectItem value="25-35">25-35</SelectItem>
                        <SelectItem value="35-45">35-45</SelectItem>
                        <SelectItem value="45+">45+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="funnel-stage">Funnel Stage</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Awareness</SelectItem>
                        <SelectItem value="consideration">Consideration</SelectItem>
                        <SelectItem value="decision">Decision</SelectItem>
                        <SelectItem value="retention">Retention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="persona-bio">Bio</Label>
                    <Textarea id="persona-bio" placeholder="Persona biography" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="persona-goals">Goals</Label>
                      <Textarea id="persona-goals" placeholder="Persona goals" rows={2} />
                    </div>
                    <div>
                      <Label htmlFor="persona-pains">Pains</Label>
                      <Textarea id="persona-pains" placeholder="Persona pain points" rows={2} />
                    </div>
                  </div>
                </div>
                <Button>Add Persona</Button>
              </div>
              
              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age/Type</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Pains</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personas.map((persona) => (
                      <TableRow key={persona.id}>
                        <TableCell className="font-medium">{persona.name}</TableCell>
                        <TableCell>{persona.age}</TableCell>
                        <TableCell>{persona.goals}</TableCell>
                        <TableCell>{persona.pains}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{persona.stage}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedPersona(persona.id)}>
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keyword Intelligence */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Intelligence</CardTitle>
              <CardDescription>Track and analyze keywords by persona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="keyword">Keyword</Label>
                    <Input id="keyword" placeholder="Enter keyword" />
                  </div>
                  <div>
                    <Label htmlFor="search-volume">Search Volume</Label>
                    <Input id="search-volume" type="number" placeholder="Monthly searches" />
                  </div>
                  <div>
                    <Label htmlFor="intent">Intent</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informational">Informational</SelectItem>
                        <SelectItem value="navigational">Navigational</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gsc">Google Search Console</SelectItem>
                        <SelectItem value="planner">Keyword Planner</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>Add Keyword</Button>
                  <Button variant="outline">AI Suggest Keywords</Button>
                </div>
              </div>

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Intent</TableHead>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell className="font-medium">{keyword.keyword}</TableCell>
                        <TableCell>{keyword.volume}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{keyword.intent}</Badge>
                        </TableCell>
                        <TableCell>{keyword.cluster}</TableCell>
                        <TableCell>{keyword.source}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channel Mapper */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Mapper</CardTitle>
              <CardDescription>Map content channels by persona and priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reddit">Reddit</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="channel-link">Link</Label>
                    <Input id="channel-link" placeholder="Channel URL" />
                  </div>
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" placeholder="Main topic/tag" />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority Score (1-10)</Label>
                    <Input id="priority" type="number" min="1" max="10" placeholder="Priority" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>Add Channel</Button>
                  <Button variant="outline">AI Suggest Channels</Button>
                </div>
              </div>

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell>
                          <Badge>{channel.platform}</Badge>
                        </TableCell>
                        <TableCell>{channel.link}</TableCell>
                        <TableCell>{channel.topic}</TableCell>
                        <TableCell>
                          <Badge variant={channel.priority >= 8 ? "default" : "secondary"}>
                            {channel.priority}/10
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Trends & Intent */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Trends</CardTitle>
                <CardDescription>Weekly/monthly search volume trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ searches: { label: "Searches", color: "#8884d8" } }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="searches" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Intent Distribution</CardTitle>
                <CardDescription>Breakdown of keyword intent types</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  informational: { label: "Informational", color: "#0088FE" },
                  navigational: { label: "Navigational", color: "#00C49F" },
                  transactional: { label: "Transactional", color: "#FFBB28" }
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={intentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {intentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strategy Vault */}
        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Vault</CardTitle>
              <CardDescription>Store and organize strategic notes and brainstorms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="note-title">Note Title</Label>
                  <Input id="note-title" placeholder="Strategy note title" />
                </div>
                <div>
                  <Label htmlFor="note-persona">Persona</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>{persona.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="note-body">Strategy Content</Label>
                <Textarea id="note-body" placeholder="Enter your strategic notes, brainstorms, tactics, and CTA plans..." rows={6} />
              </div>
              <div>
                <Label htmlFor="note-tags">Tags (optional)</Label>
                <Input id="note-tags" placeholder="Enter tags separated by commas" />
              </div>
              <div className="flex gap-2">
                <Button>Save Strategy Note</Button>
                <Button variant="outline">Generate AI Outline</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feed to Aurion */}
        <TabsContent value="vault" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aurion Content Vault</CardTitle>
              <CardDescription>Finalized content ready for Aurion's scheduler system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vault-persona">Persona</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>{persona.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-type">Task Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content Suggestion</SelectItem>
                      <SelectItem value="targeting">Targeting Action</SelectItem>
                      <SelectItem value="funnel">Funnel Idea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content-source">Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keywords">Keywords</SelectItem>
                      <SelectItem value="strategy">Strategy Notes</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Add to Aurion Vault
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* External Tools Panel */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Tools Panel</CardTitle>
              <CardDescription>Quick access to external research tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                  <a href="https://ads.google.com/aw/keywordplanner" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-6 w-6" />
                    Google Keyword Planner
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-6 w-6" />
                    Google Search Console
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                  <a href="https://www.notion.so/3C-Thread-to-Success-Community-Hub-1866ace1e8398050b2c6c41ea2f73a53" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-6 w-6" />
                    Notion Community Hub
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                  <a href="https://www.reddit.com/search/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-6 w-6" />
                    Reddit Search
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                  <a href="https://trends.google.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-6 w-6" />
                    YouTube Trends
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SparkToro Research Board */}
        <TabsContent value="sparktoro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SparkToro Intel Upload</CardTitle>
              <CardDescription>Upload and organize external research insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sparktoro-persona">Persona</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>{persona.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="insight-type">Insight Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="screenshot">Screenshot</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="source-link">Source Link</Label>
                <Input id="source-link" placeholder="SparkToro result URL or source link" />
              </div>
              <div>
                <Label htmlFor="summary-note">Summary Note</Label>
                <Textarea id="summary-note" placeholder="Brief description of what this insight contains" rows={3} />
              </div>
              <div>
                <Label htmlFor="insight-tags">Tags</Label>
                <Input id="insight-tags" placeholder="Add tags for search and organization" />
              </div>
              <div className="flex gap-2">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Add to Research Vault
                </Button>
                <Button variant="outline">Send to Strategy Vault</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anica's Intel Drop Zone */}
        <TabsContent value="anica" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anica's Intel Drop Zone</CardTitle>
              <CardDescription>Collect and process early-stage research and ideas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="anica-persona">Persona</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>{persona.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="note-tag">Tag</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observation">Observation</SelectItem>
                      <SelectItem value="trend">Trend</SelectItem>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="content">Content Input</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="anica-title">Note Title</Label>
                <Input id="anica-title" placeholder="Brief title for this insight" />
              </div>
              <div>
                <Label htmlFor="anica-body">Note Body</Label>
                <Textarea id="anica-body" placeholder="Detailed research notes, observations, or early-stage ideas" rows={5} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button>Save Raw Input</Button>
                <Button variant="outline">Summarize with AI</Button>
                <Button variant="outline">Add to Caelum</Button>
                <Button variant="outline">Add to Aurion Vault</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Archives */}
        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Caelum Archives</CardTitle>
              <CardDescription>Archive of past insights, strategies, and research</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="keywords">Keywords</SelectItem>
                      <SelectItem value="strategy">Strategy Notes</SelectItem>
                      <SelectItem value="sparktoro">SparkToro Insights</SelectItem>
                      <SelectItem value="raw">Raw Inputs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Personas</SelectItem>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>{persona.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Persona</TableHead>
                      <TableHead>Archived Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Sample archived strategy</TableCell>
                      <TableCell>
                        <Badge variant="outline">Strategy Notes</Badge>
                      </TableCell>
                      <TableCell>Tech Entrepreneur</TableCell>
                      <TableCell>2024-01-15</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Archived</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Restore</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
