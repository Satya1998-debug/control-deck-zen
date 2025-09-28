import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Maximize2, RefreshCw } from 'lucide-react';

interface GrafanaEmbedProps {
  grafanaUrl?: string;
  dashboardId?: string;
  panelId?: string;
  height?: string;
  theme?: 'light' | 'dark';
  refreshInterval?: number;
  timeRange?: {
    from: string;
    to: string;
  };
}

export const GrafanaEmbed: React.FC<GrafanaEmbedProps> = ({
  grafanaUrl = 'http://localhost:3000', // Default Grafana URL
  dashboardId = 'elasticsearch-dashboard',
  panelId,
  height = '500px',
  theme = 'light',
  refreshInterval = 30,
  timeRange = { from: 'now-1h', to: 'now' }
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDashboard, setSelectedDashboard] = useState(dashboardId);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Available dashboards - you can customize these
  const dashboards = [
    { id: 'elasticsearch-temperature', name: 'Temperature Analytics', description: 'Temperature sensor data visualization' },
    { id: 'elasticsearch-metrics', name: 'System Metrics', description: 'Battery, vibration, and performance metrics' },
    { id: 'elasticsearch-overview', name: 'Overview Dashboard', description: 'Complete system overview' }
  ];

  // Construct Grafana embed URL
  const buildGrafanaUrl = () => {
    let url = `${grafanaUrl}/d/${selectedDashboard}`;
    
    const params = new URLSearchParams();
    
    // Add time range
    params.append('from', timeRange.from);
    params.append('to', timeRange.to);
    
    // Add theme
    params.append('theme', theme);
    
    // Add refresh interval
    if (refreshInterval > 0) {
      params.append('refresh', `${refreshInterval}s`);
    }
    
    // Add panel-specific parameters if panelId is provided
    if (panelId) {
      params.append('viewPanel', panelId);
    }
    
    // Enable embedding
    params.append('kiosk', 'tv');
    params.append('orgId', '1');
    
    return `${url}?${params.toString()}`;
  };

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;
    
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setIsLoading(true);
  };

  const openInNewTab = () => {
    window.open(buildGrafanaUrl().replace('kiosk=tv', ''), '_blank');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl">Grafana Analytics</CardTitle>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Dashboard:</span>
              <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dashboards.map(dashboard => (
                    <SelectItem key={dashboard.id} value={dashboard.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{dashboard.name}</span>
                        <span className="text-xs text-muted-foreground">{dashboard.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={autoRefresh ? "default" : "outline"} className="text-xs">
                Auto-refresh: {autoRefresh ? `${refreshInterval}s` : 'Off'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
            >
              <ExternalLink className="h-4 w-4" />
              Open in Grafana
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const iframe = document.getElementById('grafana-iframe') as HTMLIFrameElement;
                if (iframe?.requestFullscreen) {
                  iframe.requestFullscreen();
                }
              }}
            >
              <Maximize2 className="h-4 w-4" />
              Fullscreen
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative" style={{ height }}>
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading Grafana dashboard...</span>
              </div>
            </div>
          )}
          
          <iframe
            id="grafana-iframe"
            key={`${selectedDashboard}-${refreshKey}`}
            src={buildGrafanaUrl()}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Grafana Dashboard"
            onLoad={() => setIsLoading(false)}
            className="rounded-lg border"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> Ensure Grafana is running at {grafanaUrl} and has the Elasticsearch data source configured.
            Dashboard ID: {selectedDashboard}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};