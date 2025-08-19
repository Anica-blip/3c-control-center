import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiagnosticLog {
  id: number;
  log_type: string;
  message: string;
  created_at: string;
}

export function ErrorLogs() {
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('diagnostic_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching logs:', error);
        toast.error("Failed to load error logs");
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while loading logs");
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (logType: string) => {
    switch (logType) {
      case 'post_processing_error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'post_processing':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'scheduled_posts_check':
        return <Info className="h-4 w-4 text-info" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const getLogBadge = (logType: string) => {
    switch (logType) {
      case 'post_processing_error':
        return <Badge variant="destructive">Error</Badge>;
      case 'post_processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'scheduled_posts_check':
        return <Badge variant="outline">Check</Badge>;
      default:
        return <Badge variant="outline">{logType}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-PT', {
      timeZone: 'Europe/Lisbon',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Error Logs</h2>
          <p className="text-muted-foreground">Monitor system activity and error messages</p>
        </div>
        <Button onClick={fetchLogs} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 50 system log entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No logs found.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLogIcon(log.log_type)}
                          {getLogBadge(log.log_type)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTimestamp(log.created_at)}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="break-words text-sm">
                          {log.message}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}