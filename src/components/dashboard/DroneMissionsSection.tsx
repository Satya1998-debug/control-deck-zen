import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, MapPin, Plane } from "lucide-react";

export const DroneMissionsSection = () => {
  const missions = [
    {
      id: "#1",
      status: "Completed",
      result: "No critical issues",
      timestamp: "2 hours ago",
      location: "Building A - Level 3"
    },
    {
      id: "#2", 
      status: "In Progress",
      result: "Thermal anomaly detected",
      timestamp: "45 minutes ago",
      location: "External Perimeter"
    },
    {
      id: "#3",
      status: "Scheduled",
      result: "Pending execution",
      timestamp: "In 30 minutes",
      location: "Building B - Rooftop"
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Drone Missions
          </CardTitle>
          
      
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {missions.map((mission) => (
            <Card key={mission.id} className="bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">Mission {mission.id}</h4>
                      <Badge 
                        variant={mission.status === "Completed" ? "outline" : mission.status === "In Progress" ? "destructive" : "secondary"}
                        className={
                          mission.status === "Completed" 
                            ? "border-status-operational text-status-operational" 
                            : mission.status === "In Progress"
                            ? "border-status-warning text-status-warning"
                            : ""
                        }
                      >
                        {mission.status === "Completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {mission.status === "In Progress" && <Clock className="h-3 w-3 mr-1" />}
                        {mission.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">
                      <span className="text-muted-foreground">Result: </span>
                      <span className={mission.result.includes("anomaly") ? "text-status-warning" : "text-foreground"}>
                        {mission.result}
                      </span>
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {mission.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mission.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {mission.status === "Completed" && (
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                    )}
                    {mission.status === "In Progress" && (
                      <Button variant="outline" size="sm">
                        Monitor
                      </Button>
                    )}
                    {mission.status === "Scheduled" && (
                      <Button variant="outline" size="sm">
                        Launch Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};