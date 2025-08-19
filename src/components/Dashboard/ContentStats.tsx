
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Heart, MessageCircle, Share, Eye } from "lucide-react";

export function ContentStats() {
  const stats = [
    {
      title: "Total Content Pieces",
      value: "247",
      change: "+12 this week",
      trend: "up",
      icon: TrendingUp
    },
    {
      title: "Active Templates",
      value: "34",
      change: "+3 this month",
      trend: "up",
      icon: Users
    },
    {
      title: "Avg. Engagement Rate",
      value: "8.4%",
      change: "+2.1% vs last month",
      trend: "up",
      icon: Heart
    },
    {
      title: "Top Performing Category",
      value: "Motivation",
      change: "89% engagement",
      trend: "stable",
      icon: MessageCircle
    }
  ];

  const topPerformers = [
    {
      title: "Morning Motivation Series",
      type: "Affirmation",
      engagement: 94,
      reach: 3200
    },
    {
      title: "Transformation Tuesday",
      type: "Video Caption",
      engagement: 87,
      reach: 2800
    },
    {
      title: "Mindset Monday Quote",
      type: "Quote",
      engagement: 82,
      reach: 2100
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Top Performing Content</CardTitle>
          <CardDescription>Your highest engagement content this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {item.engagement}%
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {item.reach}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
