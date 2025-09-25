import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, Cpu, Eye, AlertTriangle, Bell } from "lucide-react";

export const SwimLaneSection = () => {
  const eventFlow = [
    {
      stage: "Telemetry Source",
      icon: Database,
      description: "Sensor data collection",
      status: "active"
    },
    {
      stage: "Ingestor", 
      icon: ArrowRight,
      description: "Data processing pipeline",
      status: "active"
    },
    {
      stage: "Feature Extractor",
      icon: Cpu,
      description: "Signal analysis & ML features",
      status: "active"
    },
    {
      stage: "Digital Twin",
      icon: Eye,
      description: "Virtual asset modeling",
      status: "active"
    },
    {
      stage: "Anomaly Model",
      icon: AlertTriangle,
      description: "Predictive analytics",
      status: "warning"
    },
    {
      stage: "Alerting",
      icon: Bell,
      description: "Notification system",
      status: "active"
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Swimlane — Demo Event Flow (UC-01 thin slice)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Focus only on participating objects. No sequence diagram — swimlane-style flow above.
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between space-x-4 overflow-x-auto pb-4">
          {eventFlow.map((stage, index) => (
            <div key={stage.stage} className="flex items-center gap-4 min-w-fit">
              <div className="flex flex-col items-center space-y-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                  stage.status === 'active' 
                    ? 'bg-primary/20 text-primary' 
                    : stage.status === 'warning'
                    ? 'bg-status-warning/20 text-status-warning'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <stage.icon className="h-6 w-6" />
                </div>
                
                <div className="text-center">
                  <h4 className="font-semibold text-sm">{stage.stage}</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-24">
                    {stage.description}
                  </p>
                </div>
                
                <Badge 
                  variant={stage.status === 'active' ? 'outline' : 'secondary'}
                  className={
                    stage.status === 'active' 
                      ? 'border-primary text-primary' 
                      : stage.status === 'warning'
                      ? 'border-status-warning text-status-warning'
                      : ''
                  }
                >
                  {stage.status === 'active' ? 'Online' : stage.status === 'warning' ? 'Alert' : 'Offline'}
                </Badge>
              </div>
              
              {index < eventFlow.length - 1 && (
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-status-warning" />
            <span className="font-semibold text-sm">Current Flow Status</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Anomaly model has detected elevated vibration patterns. Alert threshold exceeded at 3.48 mm/s. 
            Notification sent to maintenance team. Recommended action: Schedule inspection within 24 hours.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};