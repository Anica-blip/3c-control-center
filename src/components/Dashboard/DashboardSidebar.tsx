import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  MessageCircle,
  Calendar,
  Brain,
  Settings,
  Shield,
  Bot
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    end: true
  },
  {
    name: "Content Manager",
    href: "/dashboard/content",
    icon: FileText
  },
  {
    name: "Message Monitor",
    href: "/dashboard/messages",
    icon: MessageSquare
  },
  {
    name: "Chat Manager",
    href: "/dashboard/chat",
    icon: MessageCircle
  },
  {
    name: "Scheduled Content",
    href: "/dashboard/scheduled",
    icon: Calendar
  },
  {
    name: "Marketing Center",
    href: "/dashboard/caelum",
    icon: Brain
  },
  {
    name: "Admin",
    href: "/dashboard/admin",
    icon: Shield
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings
  }
];

const bottomNavigation = [
  {
    name: "Web Chat",
    href: "/dashboard/webchat",
    icon: Bot
  }
];

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">3C</span>
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">Control Center</h1>
            <p className="text-xs text-sidebar-foreground/60">Thread To Success</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {bottomNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
