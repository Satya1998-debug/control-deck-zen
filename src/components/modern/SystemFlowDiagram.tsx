import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, Cpu, Brain, Bell, Eye, Activity } from "lucide-react";

export const SystemFlowDiagram = () => {
  const systemNodes = [
    {
      id: 1,
      name: "Sensors",
      description: "Multi-modal data collection",
      icon: Activity,
      status: "active",
      metrics: { throughput: "1.2M/sec", latency: "< 1ms" }
    },
    {
      id: 2,
      name: "Data Pipeline", 
      description: "Real-time ingestion & processing",
      icon: Database,
      status: "active",
      metrics: { throughput: "850K/sec", latency: "15ms" }
    },
    {
      id: 3,
      name: "Feature Engine",
      description: "ML feature extraction",
      icon: Cpu,
      status: "active", 
      metrics: { throughput: "125K/sec", latency: "45ms" }
    },
    {
      id: 4,
      name: "Digital Twin",
      description: "Asset state modeling",
      icon: Eye,
      status: "active",
      metrics: { updateRate: "10Hz", accuracy: "94.2%" }
    },
    {
      id: 5,
      name: "AI Analytics",
      description: "Predictive maintenance engine", 
      icon: Brain,
      status: "warning",
      metrics: { predictions: "12/hr", confidence: "89%" }
    },
    {
      id: 6,
      name: "Alert System",
      description: "Multi-channel notifications",
      icon: Bell,
      status: "active",
      metrics: { alerts: "3 active", response: "< 30s" }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "border-success text-success bg-success/10";
      case "warning": return "border-warning text-warning bg-warning/10";  
      case "error": return "border-destructive text-destructive bg-destructive/10";
      default: return "border-muted text-muted-foreground bg-muted/10";
    }
  };

  return (
    <Card className="shadow-lg bg-gradient-to-r from-white via-white to-secondary/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <span>System Architecture Flow</span>
          <Badge variant="outline" className="border-status-info text-status-info">
            UC-01 Implementation
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          {/* Flow Diagram */}
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 mb-8">
            {systemNodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-4">
                <Card className={`relative w-48 h-32 ${getStatusColor(node.status)} border-2 hover:shadow-lg transition-all duration-300`}>
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <node.icon className="h-6 w-6" />
                      <Badge variant="outline" className="text-xs px-2 py-0 border-current">
                        {node.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{node.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{node.description}</p>
                      
                      <div className="space-y-1">
                        {Object.entries(node.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {index < systemNodes.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
            <Card className="bg-gradient-to-br from-success/10 to-success/5">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-success mb-2">System Health</h4>
                <p className="text-2xl font-bold text-foreground">96.8%</p>
                <p className="text-xs text-muted-foreground">Overall uptime</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-status-info/10 to-status-info/5">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-status-info mb-2">Data Flow</h4>
                <p className="text-2xl font-bold text-foreground">1.2TB/day</p>
                <p className="text-xs text-muted-foreground">Processed volume</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-warning mb-2">Predictions</h4>
                <p className="text-2xl font-bold text-foreground">89.3%</p>
                <p className="text-xs text-muted-foreground">Accuracy rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Status */}
          <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <h4 className="font-semibold text-accent">Current System Status</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              All systems operational. AI Analytics module showing elevated processing due to anomaly detection 
              in vibration patterns. Predictive models have identified potential maintenance window for Asset A-17 
              within the next 72 hours. Automated drone inspection scheduled for confirmation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};