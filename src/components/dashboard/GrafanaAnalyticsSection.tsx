import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GrafanaEmbed } from './GrafanaEmbed';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

interface Panel {
  id: string;
  title: string;
  dashboardId: string;
  panelId?: string;
  height: string;
}

interface AnalyticsView {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  panels: Panel[];
}

export const GrafanaAnalyticsSection = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Configuration for different analytics views
  const analyticsViews: Record<string, AnalyticsView> = {
    overview: {
      title: 'System Overview',
      icon: BarChart3,
      panels: [
        {
          id: 'temperature-overview',
          title: 'Temperature Trends',
          dashboardId: 'elasticsearch-temperature',
          panelId: '1',
          height: '300px'
        },
        {
          id: 'metrics-overview',
          title: 'Key Metrics',
          dashboardId: 'elasticsearch-metrics',
          panelId: '2',
          height: '300px'
        }
      ]
    },
    temperature: {
      title: 'Temperature Analytics',
      icon: TrendingUp,
      panels: [
        {
          id: 'temp-main',
          title: 'Temperature Analysis',
          dashboardId: 'elasticsearch-temperature',
          height: '400px'
        }
      ]
    },
    performance: {
      title: 'Performance Metrics',
      icon: Activity,
      panels: [
        {
          id: 'performance-main',
          title: 'System Performance',
          dashboardId: 'elasticsearch-metrics',
          height: '400px'
        }
      ]
    },
    realtime: {
      title: 'Real-time Monitoring',
      icon: Zap,
      panels: [
        {
          id: 'realtime-main',
          title: 'Live Data Stream',
          dashboardId: 'elasticsearch-realtime',
          height: '400px'
        }
      ]
    }
  };

  const currentView = analyticsViews[activeTab];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Elasticsearch Analytics
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              Live Data
            </Badge>
            <Badge variant="secondary">
              Grafana Powered
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {Object.entries(analyticsViews).map(([key, view]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <view.icon className="h-4 w-4" />
                {view.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(analyticsViews).map(([key, view]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <view.icon className="h-5 w-5" />
                  {view.title}
                </h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {view.panels.length} panel{view.panels.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {view.panels.length === 1 ? (
                // Single panel layout
                <GrafanaEmbed
                  dashboardId={view.panels[0].dashboardId}
                  panelId={view.panels[0].panelId}
                  height={view.panels[0].height}
                  refreshInterval={30}
                />
              ) : (
                // Multi-panel grid layout
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {view.panels.map((panel) => (
                    <Card key={panel.id} className="bg-secondary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{panel.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <GrafanaEmbed
                          dashboardId={panel.dashboardId}
                          panelId={panel.panelId}
                          height={panel.height}
                          refreshInterval={30}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Export Dashboard
            </Button>
            <Button variant="outline" size="sm">
              Create Alert
            </Button>
            <Button variant="outline" size="sm">
              Share Dashboard
            </Button>
            <Button variant="outline" size="sm">
              Download Report
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Grafana:</strong> http://localhost:3000
            </div>
            <div>
              <strong>Elasticsearch:</strong> http://10.0.0.90:9200
            </div>
            <div>
              <strong>Data Source:</strong> elasticsearch-datasource
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};