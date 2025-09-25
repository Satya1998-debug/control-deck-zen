import { Activity, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DashboardHeader = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Predictive Maintenance Control Center</h1>
            <p className="text-muted-foreground mt-1">Digital Twin & Asset Monitoring</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-status-operational" />
              <span className="text-sm text-muted-foreground">System Status:</span>
              <Badge variant="outline" className="border-status-operational text-status-operational">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-status-warning" />
              <span className="text-sm text-muted-foreground">Active Alerts:</span>
              <Badge variant="outline" className="border-status-warning text-status-warning">
                <AlertTriangle className="h-3 w-3 mr-1" />
                3
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};