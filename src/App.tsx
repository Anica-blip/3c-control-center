import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Overview } from "@/components/dashboard/Overview";
import { ContentManager } from "@/components/dashboard/ContentManager";
import { MessageMonitor } from "@/components/dashboard/MessageMonitor";
import { ChatManager } from "@/components/dashboard/ChatManager";
import { ScheduledContent } from "@/components/dashboard/ScheduledContent";
import { CaelumControlCenter } from "@/components/dashboard/CaelumControlCenter";
import { Settings } from "@/components/dashboard/Settings";
import { Admin } from "@/components/dashboard/Admin";
import { PublicWebChat } from "@/components/PublicWebChat";
import { TestPage } from "@/components/TestPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="messages" element={<MessageMonitor />} />
            <Route path="chat" element={<ChatManager />} />
            <Route path="scheduled" element={<ScheduledContent />} />
            <Route path="caelum" element={<CaelumControlCenter />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Settings />} />
            <Route path="webchat" element={<PublicWebChat />} />
          </Route>
          <Route path="/webchat" element={<PublicWebChat />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
