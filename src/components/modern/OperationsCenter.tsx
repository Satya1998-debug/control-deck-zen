import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plane, Wrench, Package, AlertCircle, CheckCircle2, Clock, Eye, Play } from "lucide-react";

export const OperationsCenter = () => {
  const activeMissions = [
    {
      id: "M-001", 
      type: "Thermal Inspection",
      status: "In Progress",
      progress: 65,
      location: "Sector A-17",
      eta: "12 min"
    },
    {
      id: "M-002",
      type: "Vibration Survey", 
      status: "Queued",
      progress: 0,
      location: "Building B",
      eta: "45 min"
    }
  ];

  const workOrders = [
    {
      id: "WO-2024-056",
      title: "Bearing Replacement",
      priority: "High",
      assignee: "Tech Team Alpha",
      dueDate: "Today, 4:00 PM"
    },
    {
      id: "WO-2024-057", 
      title: "Coupling Alignment",
      priority: "Medium",
      assignee: "Tech Team Beta",
      dueDate: "Tomorrow, 10:00 AM"
    }
  ];

  const inventory = [
    { item: "SKF Bearings", level: 85, status: "Good" },
    { item: "Thermal Sensors", level: 23, status: "Low" },
    { item: "Vibration Probes", level: 67, status: "Good" }
  ];

  return (
    <div className="space-y-6">
      {/* Drone Operations */}
      <Card className="shadow-lg bg-gradient-to-br from-white to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-accent" />
            <span>Autonomous Inspections</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMissions.map((mission) => (
            <div key={mission.id} className="p-4 bg-white rounded-lg border border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm">{mission.id}</h4>
                  <p className="text-sm text-muted-foreground">{mission.type}</p>
                </div>
                <Badge variant="outline" className={
                  mission.status === 'In Progress' ? 'border-accent text-accent' : 'border-muted-foreground text-muted-foreground'
                }>
                  {mission.status === 'In Progress' ? <Play className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                  {mission.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{mission.location}</span>
                  <span>ETA: {mission.eta}</span>
                </div>
                <Progress value={mission.progress} className="h-2" />
              </div>
            </div>
          ))}
          
          <Button className="w-full bg-accent hover:bg-accent/90">
            Launch New Mission
          </Button>
        </CardContent>
      </Card>

      {/* Work Orders */}
      <Card className="shadow-lg bg-gradient-to-br from-white to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span>Active Work Orders</span>
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              2 Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workOrders.map((order) => (
            <div key={order.id} className="p-4 bg-white rounded-lg border border-border/50 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{order.id}</h4>
                  <p className="text-sm text-foreground">{order.title}</p>
                </div>
                <Badge variant={order.priority === 'High' ? 'destructive' : 'secondary'}>
                  {order.priority}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Assigned: {order.assignee}</p>
                <p>Due: {order.dueDate}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Parts Inventory */}
      <Card className="shadow-lg bg-gradient-to-br from-white to-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-warning" />
            <span>Parts Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventory.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-border/50">
              <div>
                <p className="text-sm font-medium">{item.item}</p>
                <p className="text-xs text-muted-foreground">Stock Level</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{item.level}%</p>
                <div className="flex items-center space-x-1">
                  {item.status === 'Good' ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-warning" />
                  )}
                  <span className={`text-xs ${item.status === 'Good' ? 'text-success' : 'text-warning'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AR Guidance */}
      <Card className="shadow-lg bg-gradient-to-br from-white to-chart-3/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-chart-3" />
            <span>AR Guidance Ready</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              5-step repair procedure loaded for Asset A-17
            </p>
            <Button variant="outline" className="w-full border-chart-3 text-chart-3 hover:bg-chart-3/10">
              Launch AR Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};