import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { Play, Pause, Download, Maximize2, TrendingUp } from "lucide-react";

export const LiveMonitoringPanel = () => {
  const chartData = [
    { time: '00:00', temp: 62, vibration: 3.2, speed: 1505 },
    { time: '00:15', temp: 63, vibration: 3.4, speed: 1508 },
    { time: '00:30', temp: 65, vibration: 3.6, speed: 1510 },
    { time: '00:45', temp: 64, vibration: 3.5, speed: 1507 },
    { time: '01:00', temp: 66, vibration: 3.8, speed: 1512 },
    { time: '01:15', temp: 65, vibration: 3.7, speed: 1509 },
    { time: '01:30', temp: 67, vibration: 3.9, speed: 1515 },
    { time: '01:45', temp: 65, vibration: 3.6, speed: 1509 },
  ];

  const predictions = [
    { component: "Main Bearing", ttf: "71 hours", confidence: 89, risk: "Medium" },
    { component: "Motor Coupling", ttf: "156 hours", confidence: 76, risk: "Low" },
    { component: "Pump Seal", ttf: "234 hours", confidence: 92, risk: "Low" },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Live Asset Monitoring</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button size="sm" className="bg-success hover:bg-success/90">
              <Play className="h-4 w-4 mr-1" />
              Recording
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="realtime">Real-time Data</TabsTrigger>
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-chart-1 mb-2">Temperature Trend</h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <Area type="monotone" dataKey="temp" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-chart-2 mb-2">Vibration Pattern</h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line type="monotone" dataKey="vibration" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-chart-3 mb-2">Speed Analysis</h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <Area type="monotone" dataKey="speed" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-gradient-to-r from-secondary/30 to-secondary/10">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Comprehensive Timeline</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="temp" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Temperature (°C)" />
                      <Line type="monotone" dataKey="vibration" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Vibration (mm/s)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-4">
            {predictions.map((pred, index) => (
              <Card key={index} className="bg-gradient-to-r from-white to-secondary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{pred.component}</h4>
                      <p className="text-muted-foreground">Time to Failure: <span className="font-bold text-foreground">{pred.ttf}</span></p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={pred.risk === 'Low' ? 'outline' : 'secondary'} 
                             className={pred.risk === 'Low' ? 'border-success text-success' : 'border-warning text-warning'}>
                        {pred.risk} Risk
                      </Badge>
                      <p className="text-sm text-muted-foreground">Confidence: {pred.confidence}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="diagnostics">
            <Card className="bg-gradient-to-br from-status-info/10 to-status-info/5">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-4">AI Diagnostic Summary</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Thermal signature: Normal operating range</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span>Vibration pattern: Approaching maintenance threshold</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Speed regulation: Optimal performance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-status-info rounded-full"></div>
                    <span>Overall health score: 88% (Good condition)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};