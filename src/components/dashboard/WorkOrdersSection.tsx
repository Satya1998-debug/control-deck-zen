import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, Package, AlertTriangle } from "lucide-react";

export const WorkOrdersSection = () => {
  const workOrders = [
    {
      id: "WO-2024-001",
      title: "Replace Bearing C-152",
      priority: "High",
      status: "Parts Ordered",
      estimatedTime: "4 hours",
      technician: "Mike Chen",
      parts: ["SKF 6308-2RS", "Grease Type A"]
    },
    {
      id: "WO-2024-002", 
      title: "Vibration Analysis Follow-up",
      priority: "Medium",
      status: "Scheduled",
      estimatedTime: "2 hours",
      technician: "Sarah Wilson",
      parts: ["Vibration Sensor Kit"]
    }
  ];

  const inventoryItems = [
    { name: "SKF 6308-2RS Bearing", stock: 12, minStock: 5 },
    { name: "Grease Type A", stock: 3, minStock: 5 },
    { name: "Thermal Probe", stock: 8, minStock: 3 },
    { name: "Vibration Sensor", stock: 15, minStock: 10 }
  ];

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Work Orders
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New WO
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {workOrders.map((order) => (
              <Card key={order.id} className="bg-secondary/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{order.id}</h4>
                      <Badge 
                        variant={order.priority === "High" ? "destructive" : "secondary"}
                        className={order.priority === "High" ? "text-status-critical border-status-critical" : ""}
                      >
                        {order.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium">{order.title}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Status: {order.status}</div>
                      <div>Est. Time: {order.estimatedTime}</div>
                      <div>Technician: {order.technician}</div>
                      <div>Parts: {order.parts.length} items</div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};