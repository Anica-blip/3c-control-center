import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, MessageSquare, Calendar, Settings, Bot, FileText, Brain, MessageCircle, Globe, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Overview", url: "/dashboard", icon: BarChart3 },
  { title: "Content Manager", url: "/dashboard/content", icon: FileText },
  { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
  { title: "Live Chat", url: "/dashboard/chat", icon: MessageCircle },
  { title: "Public WebChat", url: "/dashboard/webchat", icon: Globe },
  { title: "Scheduled", url: "/dashboard/scheduled", icon: Calendar },
  { title: "Caelum's Control Center", url: "/dashboard/caelum", icon: Brain },
  { title: "Admin Center", url: "/dashboard/admin", icon: Shield },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg">3C Control Center</h2>
              <p className="text-sm text-muted-foreground">3C Thread To Success</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Bot Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive: navActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive(item.url) || navActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
