import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Thermometer, Activity, Gauge, Zap, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const AssetOverviewGrid = () => {
  const metrics = [
    {
      label: "Temperature",
      value: "65.0°C",
      status: "normal",
      progress: 72,
      icon: Thermometer,
      trend: "+2.1°C",
      threshold: "Max: 85°C"
    },
    {
      label: "Vibration",
      value: "3.48 mm/s",
      status: "warning",
      progress: 87,
      icon: Activity,
      trend: "+0.32 mm/s",
      threshold: "Limit: 4.0 mm/s"
    },
    {
      label: "Alignment",
      value: "0.18 mm",
      status: "normal",
      progress: 23,
      icon: Gauge,
      trend: "±0.02 mm",
      threshold: "Limit: 0.8 mm"
    },
    {
      label: "Speed",
      value: "1509 rpm",
      status: "optimal",
      progress: 95,
      icon: Zap,
      trend: "Stable",
      threshold: "Target: 1500 rpm"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "text-success";
      case "normal": return "text-status-info";
      case "warning": return "text-warning";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal": return CheckCircle2;
      case "normal": return CheckCircle2;
      case "warning": return AlertTriangle;
      case "critical": return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const StatusIcon = getStatusIcon(metric.status);
        return (
          <Card key={metric.label} className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-secondary/20">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
              metric.status === 'optimal' ? 'from-success to-success/60' :
              metric.status === 'normal' ? 'from-status-info to-status-info/60' :
              metric.status === 'warning' ? 'from-warning to-warning/60' :
              'from-destructive to-destructive/60'
            }`}></div>
            
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    metric.status === 'optimal' ? 'bg-success/10' :
                    metric.status === 'normal' ? 'bg-status-info/10' :
                    metric.status === 'warning' ? 'bg-warning/10' :
                    'bg-destructive/10'
                  }`}>
                    <metric.icon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  </div>
                </div>
                
                <Badge variant="outline" className={`${getStatusColor(metric.status)} border-current`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {metric.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Trend:</span>
                  <span className={`text-xs font-medium ${
                    metric.trend.includes('+') ? 'text-warning' : 'text-success'
                  }`}>{metric.trend}</span>
                </div>
                
                <Progress value={metric.progress} className="h-2" />
                
                <p className="text-xs text-muted-foreground">{metric.threshold}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};