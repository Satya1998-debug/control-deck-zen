import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { GrafanaAnalyticsSection } from "@/components/dashboard/GrafanaAnalyticsSection";
import { AlertCircle, CheckCircle2, Thermometer, Zap, Gauge, Activity, MessageCircle, BarChart3 } from "lucide-react";
import axios from "axios";
import { TemperatureData, TemperatureApiResponse } from "@/types/temperatureApi";

export const DigitalTwinSection = () => {
  const healthScore = 70;

  // State for temperature data
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [temperatureValue, setTemperatureValue] = useState<string>("--");

  const [vibrationData, setVibrationData] = useState<number[]>([]);
  const [vibrationValue, setVibrationValue] = useState<string>("--");
  const [batteryData, setBatteryData] = useState<number[]>([]);
  const [batteryValue, setBatteryValue] = useState<string>("--");

  const [isConnected, setIsConnected] = useState(false);
  const [latestTemperatureData, setLatestTemperatureData] = useState<TemperatureData[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<string>("");

  // Function to fetch temperature data from backend
  const fetchTemperatureData = async () => {
    try {
      // const response = await axios.get<TemperatureApiResponse>('http://10.0.0.7:9200/api/temperature');
      // const data = response.data;
      
      const data = [ {
        "time": "2025-08-20 13:41:31.183000",
        "principal": "A840419A595CB863",
        "model_id": "Temperature Sensor",
        "join_id": null,
        "battery_v": 3.175,
        "battery_status": "3",
        "humidity": 40.4,
        "temperature_0": 327.67,
        "temperature_1": 32.12,
        "received_at": "2025-08-20T13:41:30.950259015Z",
        "source_file": "delivery_stream_temperatures_delivery_stream_s3-1-2025-08-20-13-41-31-92bb6d81-0d38-40b9-8ba7-0adb65730870.parquet",
        "source_path": "E:\\Projects\\Ferianakadamie_2025\\data\\temperatures\\year=2025\\month=08\\day=20\\hour=13\\minute=41\\delivery_stream_temperatures_delivery_stream_s3-1-2025-08-20-13-41-31-92bb6d81-0d38-40b9-8ba7-0adb65730870.parquet"
      },
      {
        "time": "2025-08-20 13:41:47.168000",
        "principal": "A84041728D5CB85A",
        "model_id": "Temperature Sensor",
        "join_id": null,
        "battery_v": 3.139,
        "battery_status": "3",
        "humidity": 40.7,
        "temperature_0": 627.67,
        "temperature_1": 31.88,
        "received_at": "2025-08-20T13:41:46.872974568Z",
        "source_file": "delivery_stream_temperatures_delivery_stream_s3-1-2025-08-20-13-41-31-92bb6d81-0d38-40b9-8ba7-0adb65730870.parquet",
        "source_path": "E:\\Projects\\Ferianakadamie_2025\\data\\temperatures\\year=2025\\month=08\\day=20\\hour=13\\minute=41\\delivery_stream_temperatures_delivery_stream_s3-1-2025-08-20-13-41-31-92bb6d81-0d38-40b9-8ba7-0adb65730870.parquet"
      }
    ];
    console.log(data);
      if (data && data.length > 0) {
        // setLatestTemperatureData(data);
        setIsConnected(true);
        setLastFetchTime(new Date().toLocaleTimeString());

        // Get the latest temperature reading
        const latestReading = data[data.length - 1];

        // Update temperature values and charts
        const temp1 = latestReading.temperature_1;
        const temp0 = latestReading.temperature_0;
        const batteryVoltage = latestReading.battery_v;
        const humidity = latestReading.humidity;

        setTemperatureValue(`${temp1.toFixed(1)}°C`);
        setBatteryValue(`${batteryVoltage.toFixed(2)}V`);
        setVibrationValue(`${humidity.toFixed(1)}%`); // Using humidity as vibration for now

 // Extract all temperature values from the array and add them to chart data
    const allTemp1Values = data.map(reading => reading.temperature_0);
    const allBatteryValues = data.map(reading => reading.battery_v * 100);
    const allHumidityValues = data.map(reading => reading.humidity);

    // Update chart data with all values (keep last 10 readings)
    setTemperatureData(prev => {
      const newData = [...prev, ...allTemp1Values].slice(-10);
      return newData;
    });
    console.log(temperatureData);

    setBatteryData(prev => {
      const newData = [...prev, ...allBatteryValues].slice(-10);
      return newData;
    });

    setVibrationData(prev => {
      const newData = [...prev, ...allHumidityValues].slice(-10);
      return newData;
    });
      }
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      setIsConnected(false);
    }
  };

  // Setup polling every 10 seconds
  useEffect(() => {
    // Initial fetch
    fetchTemperatureData();

    console.log(temperatureData);
    // Set up interval for fetching every 10 seconds
    const interval = setInterval(fetchTemperatureData, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
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
      title: "Humidity",
      value: vibrationValue,
      icon: Activity,
      data: vibrationData,
      color: "hsl(var(--chart-2))"
    },
    {
      title: "Battery Voltage",
      value: batteryValue,
      icon: Gauge,
      data: batteryData,
      color: "hsl(var(--chart-3))"
    }
  ];

  // Chat window state
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);

  // Dummy chatbot response
  const handleSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages((msgs) => [...msgs, { role: "user", content: chatInput }]);
    setTimeout(() => {
      setChatMessages((msgs) => [...msgs, { role: "bot", content: `Echo: ${chatInput}` }]);
    }, 600);
    setChatInput("");
  };

//   const handleDroneDiagnose = async () => {
    
//   try {
//     const response = await axios.post('http://10.0.0.7:9200/api/diagnose');
//     console.log('Drone diagnose response:', response.data);
//     // Handle success response here if needed
//   } catch (error) {
//     console.error('Error running drone diagnose:', error);
//     // Handle error here if needed
//   }
// };
  return (
    <>
      <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl">Digital Twin & Analytics</CardTitle>

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
              {isConnected ? (
                <>
                  <Badge variant="default" className="bg-green-500">Connected</Badge>
                  <span className="text-xs text-muted-foreground">Last: {lastFetchTime}</span>
                </>
              ) : (
                <Badge variant="destructive">Disconnected</Badge>
              )}
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Grafana Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
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
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">SLA</h4>
                      <p className="text-xl font-bold text-status-operational">{"Twin < 5s"}</p>
                      <p className="text-sm text-muted-foreground">{"Alert < 10s"}</p>
                    </div>

                    <div className="flex gap-2">
                      <img
                        src="/Gemini_Generated_Image_3rxp933rxp933rxp.png"
                        alt="Inspection Drone"
                        className="w-full max-h-64 object-cover rounded-lg border shadow"
                        style={{ background: '#f8fafc' }}
                      />
                      <Button size="sm" className="bg-primary text-primary-foreground" >
                        Run drone inspection
                      </Button>
                      <Button size="sm" className="bg-primary text-primary-foreground"   onClick={handleDroneDiagnose}>
                        Run drone diagnose
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

            </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <GrafanaAnalyticsSection />
            </TabsContent>
          </Tabs>
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
