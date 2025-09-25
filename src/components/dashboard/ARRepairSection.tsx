import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, CheckCircle2, AlertCircle, Wrench } from "lucide-react";

export const ARRepairSection = () => {
  const repairSteps = [
    {
      step: 1,
      title: "Lockout/tagout Asset A-17",
      status: "completed",
      details: "Safety protocols executed"
    },
    {
      step: 2, 
      title: "Attach thermal probe; verify hotspot",
      status: "completed",
      details: "Temperature verified at 67°C"
    },
    {
      step: 3,
      title: "If vibration > 4 mm/s, replace bearing",
      status: "active",
      details: "Current: 3.48 mm/s - Monitor threshold"
    },
    {
      step: 4,
      title: "Shim coupling to < 0.3 mm",
      status: "pending",
      details: "Alignment tools required"
    },
    {
      step: 5,
      title: "Spin-up; health ≥ 85% → close WO",
      status: "pending", 
      details: "Final verification step"
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            AR-Guided Repair
            <Badge variant="outline" className="text-primary border-primary">
              Vision Pro preview
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Open AR brief JSON
            </Button>
            <Button variant="outline" size="sm" className="text-muted-foreground">
              (feed to visionOS app)
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {repairSteps.map((step) => (
            <div 
              key={step.step}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                step.status === 'active' 
                  ? 'border-primary bg-primary/5' 
                  : step.status === 'completed'
                  ? 'border-status-operational bg-status-operational/5'
                  : 'border-border bg-secondary/30'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                step.status === 'completed' 
                  ? 'bg-status-operational text-white' 
                  : step.status === 'active'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : step.status === 'active' ? (
                  <Wrench className="h-4 w-4" />
                ) : (
                  step.step
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.details}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {step.status === 'active' && (
                  <Badge variant="outline" className="border-primary text-primary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                )}
                {step.status === 'completed' && (
                  <Badge variant="outline" className="border-status-operational text-status-operational">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Next Action:</strong> Monitor vibration levels. If threshold exceeds 4 mm/s, 
            initiate bearing replacement procedure and update work order WO-2024-001.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};