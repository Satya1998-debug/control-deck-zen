import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { AlertCircle, CheckCircle2, Thermometer, Zap, Gauge, Activity, MessageCircle } from "lucide-react";

export const DigitalTwinSection = () => {
  const healthScore = 88;

  // State for temperature data
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [temperatureValue, setTemperatureValue] = useState<string>("--");

  useEffect(() => {
    fetch("http://10.0.0.90:8000/api/temperature")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const temps = data.data.map((item: any) => item.temperature);
          setTemperatureData(temps);
          setTemperatureValue(`${temps[temps.length - 1]}°C`);
        }
      });
  }, []);

  const metrics = [
    {
      title: "Temperature",
      value: temperatureValue,
      icon: Thermometer,
      data: temperatureData,
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
      title: "Battery life",
      value: "92%",
      icon: Gauge,
      data: [95, 94, 93, 92, 92, 91, 91, 92, 92, 92],
      color: "hsl(var(--chart-3))"
    }
  ];

  // Chat window state
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{role: string; content: string}>>([]);

  // Dummy chatbot response
  const handleSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages((msgs) => [...msgs, { role: "user", content: chatInput }]);
    setTimeout(() => {
      setChatMessages((msgs) => [...msgs, { role: "bot", content: `Echo: ${chatInput}` }]);
    }, 600);
    setChatInput("");
  };

  // Floating Chat Button
  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl">Digital Twin</CardTitle>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Component</span>
                <Select defaultValue="platform-a-1">
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform-a-1">Platform A-1</SelectItem>
                    <SelectItem value="platform-b-1">Platform B-1</SelectItem>
                    <SelectItem value="platform-c-1">Platform C-1</SelectItem>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 justify-center items-stretch">
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
                <h4 className="font-semibold mb-2 text-status-warning">Ri1231sk (derived)</h4>
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
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/30">
              <CardContent className="p-4">
                <div className="space-y-4">
                 
                  <div>
                    <h4 className="font-semibold mb-1">TTF Estimate</h4>
                    <p className="text-xl font-bold">71h</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Ingestion Latency</h4>
                    <p className="text-xl font-bold">21ms</p>
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
      {/* Floating Chat Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full shadow-lg p-4 hover:bg-primary/90 transition-colors"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
        aria-label="Open Chatbot"
        onClick={() => setShowChat((v) => !v)}
      >
        <MessageCircle className="w-7 h-7" />
      </button>
      {/* Chat Popup */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-background border border-border rounded-lg shadow-xl flex flex-col">
          <div className="p-3 border-b border-border font-semibold text-primary">Chatbot</div>
          <div className="flex-1 p-3 overflow-y-auto max-h-64">
            {chatMessages.length === 0 && (
              <div className="text-muted-foreground text-sm">Start the conversation...</div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`mb-2 text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <span className={msg.role === "user" ? "bg-primary text-primary-foreground px-2 py-1 rounded" : "bg-secondary px-2 py-1 rounded"}>
                  {msg.content}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm bg-white text-black"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder="Type your message..."
            />
            <Button size="sm" onClick={handleSend}>Send</Button>
          </div>
        </div>
      )}
    </>
  );
};