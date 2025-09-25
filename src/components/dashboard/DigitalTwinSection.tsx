import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { AlertCircle, CheckCircle2, Thermometer, Zap, Gauge, Activity } from "lucide-react";

export const DigitalTwinSection = () => {
  const healthScore = 88;
  
  const metrics = [
    {
      title: "Temperature",
      value: "65.0°C",
      icon: Thermometer,
      data: [62, 63, 65, 64, 66, 65, 67, 65, 64, 65],
      color: "hsl(var(--chart-1))"
    },
    {
      title: "Vibration",
      value: "3.48 mm/s",
      icon: Activity,
      data: [3.2, 3.4, 3.6, 3.5, 3.8, 3.7, 3.9, 3.6, 3.4, 3.5],
      color: "hsl(var(--chart-2))"
    },
    {
      title: "Alignment",
      value: "0.18 mm",
      icon: Gauge,
      data: [0.15, 0.16, 0.18, 0.17, 0.19, 0.18, 0.20, 0.18, 0.17, 0.18],
      color: "hsl(var(--chart-3))"
    },
    {
      title: "Speed",
      value: "1509 rpm",
      icon: Zap,
      data: [1500, 1510, 1505, 1508, 1512, 1509, 1515, 1507, 1504, 1509],
      color: "hsl(var(--chart-4))"
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl">Digital Twin</CardTitle>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Asset</span>
              <Badge variant="secondary">A-17</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Component</span>
              <Select defaultValue="bearing-c-152">
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bearing-c-152">Bearing C-152</SelectItem>
                  <SelectItem value="motor-m-101">Motor M-101</SelectItem>
                  <SelectItem value="pump-p-203">Pump P-203</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mode:</span>
              <Badge variant="outline" className="text-primary border-primary">Simulated</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Backend:</span>
              <Badge variant="destructive">down</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{healthScore}%</div>
              <div className="text-sm text-muted-foreground">Health</div>
              <Progress value={healthScore} className="w-20 mt-1" />
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-status-warning flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Live Alerts
              </div>
              <div className="text-sm text-muted-foreground mt-1">3 active</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {metrics.map((metric) => (
            <Card key={metric.title} className="bg-secondary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.title}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-3">{metric.value}</div>
                <MetricChart data={metric.data} color={metric.color} />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-secondary/30">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 text-status-warning">Risk (derived)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {"Thresholds: T>85°C, V>3mm/s, A>0.8mm"}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Temp fault</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked className="rounded accent-status-warning" />
                  <span className="text-sm">Vibration fault</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Misalignment</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">Fetch twin</Button>
                <Button variant="outline" size="sm">Diagnose now</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Model IsolationForest (PyOD)</h4>
                  <p className="text-sm text-muted-foreground">Score: 2, Confidence: 0.61</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">TTF Estimate</h4>
                  <p className="text-xl font-bold">71h</p>
                  <p className="text-sm text-muted-foreground">Heuristic based on severity & drift</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Ingestion Latency</h4>
                  <p className="text-xl font-bold">21ms</p>
                  <p className="text-sm text-muted-foreground">Bus → Twin</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">SLA</h4>
                  <p className="text-xl font-bold text-status-operational">{"Twin < 5s"}</p>
                  <p className="text-sm text-muted-foreground">{"Alert < 10s"}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    Run drone inspection
                  </Button>
                </div>
                
                <div>
                  <Button variant="outline" size="sm" className="w-full">
                    Export test case JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};