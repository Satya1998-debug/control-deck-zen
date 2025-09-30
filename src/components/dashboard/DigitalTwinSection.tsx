import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { DualMetricChart } from "@/components/dashboard/DualMetricChart";
import { GrafanaAnalyticsSection } from "@/components/dashboard/GrafanaAnalyticsSection";
import { AlertCircle, CheckCircle2, Thermometer, Zap, Gauge, Activity, MessageCircle, BarChart3 } from "lucide-react";
import axios from "axios";
import { TemperatureData, TemperatureApiResponse } from "@/types/temperatureApi";

// Interface for diagnose response
interface DamageReport {
  triggered: boolean;
  type_of_damage: string;
  location: string | null;
  initial_level: number;
  latest_level: number;
  increase_fraction: number;
  severity: string;
}

interface WorkflowSummary {
  message: string;
}

interface DiagnoseResult {
  num_images?: number;
  damage_report?: DamageReport;
  workflow_summary?: WorkflowSummary;
  report_path?: string;
  message?: string;
  location?: string;
  loaction?: string; // Handle typo in API response for AT1
}

interface DiagnoseResponse {
  [key: string]: DiagnoseResult;
}

// Interface for battery status response
interface BatteryStatusSensor {
  battery_status: number | null;
  sensor_id: string;
}

interface BatteryStatusResponse {
  temperature: BatteryStatusSensor;
  potential: BatteryStatusSensor;
  distance: BatteryStatusSensor;
}

interface DigitalTwinSectionProps {
  onCreateMission: (location: string) => void;
}

export const DigitalTwinSection = ({ onCreateMission }: DigitalTwinSectionProps) => {
  const healthScore = 70;

  // State for temperature data
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [temperature0Data, setTemperature0Data] = useState<number[]>([]);
  const [temperature1Data, setTemperature1Data] = useState<number[]>([]);
  const [temperatureValue, setTemperatureValue] = useState<string>("--");
  const [temperature0Value, setTemperature0Value] = useState<string>("--");
  const [temperature1Value, setTemperature1Value] = useState<string>("--");

  const [vibrationData, setVibrationData] = useState<number[]>([]);
  const [vibrationValue, setVibrationValue] = useState<string>("--");
  const [batteryData, setBatteryData] = useState<number[]>([]);
  const [batteryValue, setBatteryValue] = useState<string>("--");

  const [isConnected, setIsConnected] = useState(false);
  const [latestTemperatureData, setLatestTemperatureData] = useState<TemperatureData[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<string>("");

  // State for diagnose data
  const [diagnoseData, setDiagnoseData] = useState<DiagnoseResponse | null>(null);
  const [showDiagnoseResults, setShowDiagnoseResults] = useState(false);
  const [isRunningDiagnose, setIsRunningDiagnose] = useState(false);
  const [diagnoseError, setDiagnoseError] = useState<string | null>(null);
  const [missionCreated, setMissionCreated] = useState(false);
  
  // State for inspection workflow
  const [isInspectionRunning, setIsInspectionRunning] = useState(false);
  const [isDiagnoseHighlighted, setIsDiagnoseHighlighted] = useState(false);
  const [inspectionTimer, setInspectionTimer] = useState<NodeJS.Timeout | null>(null);

  // State for battery status
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatusResponse | null>(null);
  const [batteryStatusError, setBatteryStatusError] = useState<string | null>(null);

  // Risk calculation functions
  const calculateRiskStates = () => {
    // Parse current temperature value
    const currentTemp = parseFloat(temperatureValue.replace('°C', '')) || 0;
    
    // Parse current vibration (humidity) value
    const currentVibration = parseFloat(vibrationValue.replace('%', '')) || 0;
    
    // Check for temperature fault (threshold: >300°C)
    const tempFault = currentTemp > 300;
    
    // Check for vibration fault (using humidity as proxy, threshold: >80% indicates high vibration)
    const vibrationFault = currentVibration > 80;
    
    // Check for crack detection alerts from AT1 specifically
    const crackDetected = diagnoseData && diagnoseData.AT1 ? 
      (diagnoseData.AT1.damage_report?.triggered === true && 
       diagnoseData.AT1.damage_report?.type_of_damage?.toLowerCase().includes('crack')) ||
      (diagnoseData.AT1.message && 
       !diagnoseData.AT1.message.toLowerCase().includes('good') && 
       !diagnoseData.AT1.message.toLowerCase().includes('no')) : false;
    
    // Check for dirt detection alerts from AT3 specifically
    const dirtDetected = diagnoseData && diagnoseData.AT3 ? 
      (diagnoseData.AT3.damage_report?.triggered === true && 
       diagnoseData.AT3.damage_report?.type_of_damage?.toLowerCase().includes('dirt')) ||
      (diagnoseData.AT3.damage_report?.type_of_damage?.toLowerCase().includes('surface')) : false;
    
    return {
      tempFault,
      vibrationFault,
      crackDetected,
      dirtDetected
    };
  };

  const riskStates = calculateRiskStates();

  // Function to fetch temperature data from backend
  const fetchTemperatureData = async () => {
    try {
      const response = await axios.get<TemperatureApiResponse>('http://localhost:8000/api/temperature');
      const data = response.data.data; // Access the data array from the response
      
      console.log(data);
      if (data && data.length > 0) {
        setIsConnected(true);
        setLastFetchTime(new Date().toLocaleTimeString());

        // Get the latest temperature reading
        const latestReading = data[data.length - 1];

        // Update temperature values with latest reading
        const temp1 = latestReading.temperature_1;
        const temp0 = latestReading.temperature_0;
        const batteryVoltage = latestReading.battery_v;
        const humidity = latestReading.humidity;

        setTemperatureValue(`${temp1.toFixed(1)}°C`);
        setTemperature0Value(`${temp0.toFixed(1)}°C`);
        setTemperature1Value(`${temp1.toFixed(1)}°C`);
        setBatteryValue(`${batteryVoltage.toFixed(2)}V`);
        setVibrationValue(`${humidity.toFixed(1)}%`); // Using humidity as vibration for now

        // Extract all temperature values from the array
        const allTemp0Values = data.map(reading => reading.temperature_0);
        const allTemp1Values = data.map(reading => reading.temperature_1);
        const allBatteryValues = data.map(reading => reading.battery_v * 100);
        const allHumidityValues = data.map(reading => reading.humidity);

        // Replace chart data with all fetched values (keep last 10 readings)
        setTemperature0Data(allTemp0Values.slice(-10));
        setTemperature1Data(allTemp1Values.slice(-10));
        setTemperatureData(allTemp1Values.slice(-10)); // Keep for backward compatibility
        setBatteryData(allBatteryValues.slice(-10));
        setVibrationData(allHumidityValues.slice(-10));
      }
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      setIsConnected(false);
    }
  };

  // Function to fetch battery status from backend
  const fetchBatteryStatus = async () => {
    try {
      const response = await axios.get<BatteryStatusResponse>('http://localhost:8000/api/battery_status');
      console.log('Battery status response:', response.data);
      setBatteryStatus(response.data);
      setBatteryStatusError(null);
    } catch (error) {
      console.error('Error fetching battery status:', error);
      setBatteryStatusError('Failed to fetch battery status');
    }
  };

  // Setup polling every 1 minute
  useEffect(() => {
    // Initial fetch
    fetchTemperatureData();
    fetchBatteryStatus();

    console.log(temperatureData);
    // Set up interval for fetching every 1 minute
    const interval = setInterval(() => {
      fetchTemperatureData();
      fetchBatteryStatus();
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Cleanup inspection timer on component unmount
  useEffect(() => {
    return () => {
      if (inspectionTimer) {
        clearTimeout(inspectionTimer);
      }
    };
  }, [inspectionTimer]);

  const metrics = [
    {
      title: "Temperature",
      value: temperatureValue,
      icon: Thermometer,
      data: temperatureData,
      dualData: {
        data1: temperature0Data,
        data2: temperature1Data,
        color1: "hsl(var(--chart-1))",
        color2: "hsl(var(--chart-4))",
        label1: "Temp 0",
        label2: "Temp 1",
        value1: temperature0Value,
        value2: temperature1Value
      },
      color: "hsl(var(--chart-1))",
      isDual: true
    },
    {
      title: "Humidity",
      value: vibrationValue,
      icon: Activity,
      data: vibrationData,
      color: "hsl(var(--chart-2))",
      unit: "%"
    },
    {
      title: "Battery Voltage",
      value: batteryValue,
      icon: Gauge,
      data: batteryData,
      color: "hsl(var(--chart-3))",
      unit: "V"
    },
     {
      title: "Vibration",
      value: vibrationValue,
      icon: Activity,
      data: vibrationData,
      color: "hsl(var(--chart-2))",
      unit: "%"
    }
  ];

  // Chat window state
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string; timestamp?: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Chat functionality with backend integration
  const handleSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = chatInput.trim();
    console.log('Sending message:', userMessage); // Debug log
    
    // Add user message to chat first
    setChatMessages((msgs) => [...msgs, { 
      role: "user", 
      content: userMessage,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    // Clear input field after capturing the message
    setChatInput("");
    setIsChatLoading(true);
    
    try {
      console.log('API Request payload:', { message: userMessage, user_query: userMessage }); // Debug log
      
      const response = await axios.post('http://localhost:8000/api/mcp/chat', {
        message: userMessage,
        user_query: userMessage
      });
      
      console.log('API Response:', response.data); // Debug log
      
      // Add AI response to chat
      setChatMessages((msgs) => [...msgs, { 
        role: "assistant", 
        content: response.data.response,
        timestamp: response.data.timestamp || new Date().toLocaleTimeString()
      }]);
      
    } catch (error) {
      console.error('Error sending chat message:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Response error:', error.response.data); // Debug log
          errorMessage = `Error: ${error.response.data?.message || 'Server error'}`;
        } else if (error.request) {
          console.error('Request error:', error.request); // Debug log
          errorMessage = 'Unable to connect to ParkIT AI. Please check your connection.';
        }
      }
      
      // Add error message to chat
      setChatMessages((msgs) => [...msgs, { 
        role: "assistant", 
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDroneDiagnose = async () => {
    setIsRunningDiagnose(true);
    setShowDiagnoseResults(false);
    setDiagnoseError(null);
    setIsDiagnoseHighlighted(false); // Reset highlight when diagnose is clicked
    
    try {
      console.log('Starting drone diagnose...');
      const response = await axios.get('http://localhost:8000/api/diagnose');
      console.log('Drone diagnose response:', response.data);
      setDiagnoseData(response.data);
      setShowDiagnoseResults(true);
    } catch (error) {
      console.error('Error running drone diagnose:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          
          errorMessage = `Server Error ${error.response.status}: ${error.response.data?.message || error.response.data?.detail || 'Unknown server error'}`;
        } else if (error.request) {
          // Network error - request was made but no response received
          console.error('Network error - no response received:', error.request);
          errorMessage = 'Network Error: Could not connect to the server. Please check if the backend is running on localhost:8000';
        } else {
          // Something else happened
          console.error('Error message:', error.message);
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setDiagnoseError(errorMessage);
    } finally {
      setIsRunningDiagnose(false);
    }
  };

  const handleDroneInspection = () => {
    // Get the currently selected platform from the dropdown
    const selectedPlatform = "Platform A-1"; // You can make this dynamic based on the Select component
    
    // Create a new drone mission for inspection
    const inspectionLocation = `${selectedPlatform} - Structural Inspection`;
    onCreateMission(inspectionLocation);
    
    // Show success feedback
    setMissionCreated(true);
    setTimeout(() => setMissionCreated(false), 3000); // Hide after 3 seconds
    
    // Start inspection workflow
    setIsInspectionRunning(true);
    
    // Set timer for 25 seconds
    const timer = setTimeout(() => {
      setIsInspectionRunning(false);
      setIsDiagnoseHighlighted(true);
      console.log('Inspection completed! Diagnose button is now highlighted.');
    }, 25000); // 25 seconds
    
    setInspectionTimer(timer);
    
    // Optional: Show a confirmation message
    console.log(`Drone inspection mission created for ${inspectionLocation}`);
  };
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
            {/* <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Grafana Analytics
            </TabsTrigger> */}
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
                    {(metric as any).isDual ? (
                      <DualMetricChart 
                        data1={(metric as any).dualData.data1}
                        data2={(metric as any).dualData.data2}
                        color1={(metric as any).dualData.color1}
                        color2={(metric as any).dualData.color2}
                        label1={(metric as any).dualData.label1}
                        label2={(metric as any).dualData.label2}
                        value1={(metric as any).dualData.value1}
                        value2={(metric as any).dualData.value2}
                      />
                    ) : (
                      <MetricChart 
                        data={metric.data} 
                        color={metric.color} 
                        unit={(metric as any).unit || ""}
                      />
                    )}
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
                      <Button 
                        size="sm" 
                        className="bg-primary text-primary-foreground" 
                        onClick={handleDroneInspection}
                        disabled={isInspectionRunning}
                      >
                        {isInspectionRunning ? 'Inspection Running...' : 'Run drone inspection'}
                      </Button>
                      <Button 
                        size="sm" 
                        className={`${isDiagnoseHighlighted 
                          ? 'bg-yellow-500 text-white animate-pulse shadow-lg border-2 border-yellow-300' 
                          : 'bg-primary text-primary-foreground'
                        }`}
                        onClick={handleDroneDiagnose}
                        disabled={isRunningDiagnose}
                      >
                        {isRunningDiagnose ? 'Running...' : 'Run drone diagnose'}
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
                    {"Thresholds: T>300°C, V>80%, Crack (AT1), Dirt (AT3)"}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={riskStates.tempFault}
                        readOnly
                        className={`rounded ${riskStates.tempFault ? 'accent-red-500' : ''}`} 
                      />
                      <span className={`text-sm ${riskStates.tempFault ? 'text-red-600 font-medium' : ''}`}>
                        Temperature fault {riskStates.tempFault ? `(${temperatureValue})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={riskStates.vibrationFault}
                        readOnly
                        className={`rounded ${riskStates.vibrationFault ? 'accent-yellow-500' : ''}`} 
                      />
                      <span className={`text-sm ${riskStates.vibrationFault ? 'text-yellow-600 font-medium' : ''}`}>
                        Vibration fault {riskStates.vibrationFault ? `(${vibrationValue})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={riskStates.crackDetected}
                        readOnly
                        className={`rounded ${riskStates.crackDetected ? 'accent-orange-500' : ''}`} 
                      />
                      <span className={`text-sm ${riskStates.crackDetected ? 'text-orange-600 font-medium' : ''}`}>
                        Crack detected {riskStates.crackDetected ? '(Alert)' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={riskStates.dirtDetected}
                        readOnly
                        className={`rounded ${riskStates.dirtDetected ? 'accent-brown-500' : ''}`} 
                      />
                      <span className={`text-sm ${riskStates.dirtDetected ? 'text-amber-600 font-medium' : ''}`}>
                        Dirt detected {riskStates.dirtDetected ? '(Alert)' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {(riskStates.tempFault || riskStates.vibrationFault || riskStates.crackDetected || riskStates.dirtDetected) && (
                      <Badge variant="destructive" className="text-xs">
                        {[
                          riskStates.tempFault && 'Temperature', 
                          riskStates.vibrationFault && 'Vibration', 
                          riskStates.crackDetected && 'Crack', 
                          riskStates.dirtDetected && 'Dirt'
                        ].filter(Boolean).join(', ')} Alert
                      </Badge>
                    )}
                    {!riskStates.tempFault && !riskStates.vibrationFault && !riskStates.crackDetected && !riskStates.dirtDetected && (
                      <Badge variant="default" className="bg-green-500 text-xs">
                        All Systems Normal
                      </Badge>
                    )}
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

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2 text-lg">Battery Status</h4>
                      {batteryStatusError ? (
                        <div className="bg-red-100 border border-red-300 rounded p-2">
                          <p className="text-sm text-red-600">{batteryStatusError}</p>
                        </div>
                      ) : batteryStatus ? (
                        <div className="space-y-2 bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Temperature Sensor:</span>
                            <span className={`text-sm font-bold ${
                              batteryStatus.temperature.battery_status !== null ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {batteryStatus.temperature.battery_status !== null 
                                ? `${batteryStatus.temperature.battery_status.toFixed(2)}V` 
                                : 'N/A'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Potential Sensor:</span>
                            <span className={`text-sm font-bold ${
                              batteryStatus.potential.battery_status !== null ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {batteryStatus.potential.battery_status !== null 
                                ? `${batteryStatus.potential.battery_status.toFixed(2)}V` 
                                : 'N/A'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Distance Sensor:</span>
                            <span className={`text-sm font-bold ${
                              batteryStatus.distance.battery_status !== null ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {batteryStatus.distance.battery_status !== null 
                                ? `${batteryStatus.distance.battery_status.toFixed(2)}V` 
                                : 'N/A'}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                            Last updated: {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-100 border border-blue-300 rounded p-2">
                          <p className="text-sm text-blue-600">Loading battery status...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Mission Created Success Message */}
            {missionCreated && (
              <div className="mt-6">
                <Card className="shadow-lg border-green-200">
                  <CardContent className="p-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 font-medium">Drone inspection mission created successfully!</p>
                      </div>
                      <p className="text-green-700 text-sm mt-1">Check the Drone Missions section below to track the mission progress.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Diagnose Ready Notification */}
            {isDiagnoseHighlighted && (
              <div className="mt-6">
                <Card className="shadow-lg border-yellow-200">
                  <CardContent className="p-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <p className="text-yellow-800 font-medium">Inspection completed! Diagnosis is now available.</p>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">Click the "Run drone diagnose" button to analyze the inspection results.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Diagnose Results Section */}
            {showDiagnoseResults && diagnoseData && (
              <div className="mt-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Drone Diagnose Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {Object.entries(diagnoseData).map(([platform, result]) => {
                        // Check for location fields: correct spelling, typo, damage_report.location, then fall back to platform key
                        const displayName = result.location || result.loaction || result.damage_report?.location || platform;
                        
                        return (
                        <Card key={platform} className="bg-secondary/30">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg">{displayName}</h4>
                                <Badge 
                                  variant={
                                    result.damage_report?.triggered === true ? "destructive" : "default"
                                  }
                                  className={
                                    result.damage_report?.triggered === true ? "" : "bg-green-500"
                                  }
                                >
                                  {result.damage_report?.triggered === true ? "Damage Detected" : "No Damage"}
                                </Badge>
                              </div>

                              {result.message ? (
                                <p className="text-sm text-green-600 font-medium">{result.message}</p>
                              ) : (
                                <>
                                  {result.num_images && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Images analyzed: </span>
                                      <span className="font-medium">{result.num_images}</span>
                                    </div>
                                  )}

                                  {result.workflow_summary && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Status: </span>
                                      <span className="font-medium text-green-600">{result.workflow_summary.message}</span>
                                    </div>
                                  )}

                                  {result.damage_report && (
                                    <div className="space-y-2">
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Damage Type: </span>
                                        <span className="font-medium">{result.damage_report.type_of_damage}</span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Severity: </span>
                                        <Badge variant="outline" className="text-xs">
                                          {result.damage_report.severity}
                                        </Badge>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Level Change: </span>
                                        <span className="font-medium">
                                          {result.damage_report.initial_level} → {result.damage_report.latest_level}
                                        </span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Change %: </span>
                                        <span className={`font-medium ${result.damage_report.increase_fraction < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {(result.damage_report.increase_fraction * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {result.report_path && (
                                    <div className="mt-3 pt-3 border-t">
                                      <div className="flex gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="flex-1 text-xs"
                                          onClick={() => {
                                            const filename = result.report_path?.split('/').pop() || result.report_path;
                                            window.open(`http://localhost:8000/api/pdf/view/${filename}`, '_blank');
                                          }}
                                        >
                                          View PDF
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="flex-1 text-xs"
                                          onClick={() => {
                                            const filename = result.report_path?.split('/').pop() || result.report_path;
                                            const link = document.createElement('a');
                                            link.href = `http://localhost:8000/api/pdf/download/${filename}`;
                                            link.download = filename || 'report.pdf';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}
                                        >
                                          Download
                                        </Button>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Report: {result.report_path}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Diagnose Error Section */}
            {diagnoseError && (
              <div className="mt-6">
                <Card className="shadow-lg border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      Drone Diagnose Error
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{diagnoseError}</p>
                      <div className="mt-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setDiagnoseError(null)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Dismiss
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleDroneDiagnose}
                          disabled={isRunningDiagnose}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          {isRunningDiagnose ? 'Retrying...' : 'Retry'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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
        aria-label="Open ParkIT AI Agent"
        onClick={() => setShowChat((v) => !v)}
      >
        <MessageCircle className="w-7 h-7" />
      </button>
      {/* Chat Popup */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-background border border-border rounded-lg shadow-xl flex flex-col">
          <div className="p-3 border-b border-border font-semibold text-primary">ParkIT AI Agent</div>
          <div className="flex-1 p-3 overflow-y-auto max-h-64">
            {chatMessages.length === 0 && (
              <div className="text-muted-foreground text-sm">
                👋 Hi! I'm your ParkIT AI assistant. Ask me anything about your parking systems, diagnostics, or maintenance.
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`mb-3 text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <div className={`inline-block max-w-[85%] ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground px-3 py-2 rounded-lg" 
                    : "bg-secondary px-3 py-2 rounded-lg"
                }`}>
                  <div>{msg.content}</div>
                  {msg.timestamp && (
                    <div className={`text-xs mt-1 opacity-70 ${
                      msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                    }`}>
                      {msg.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="text-left mb-3">
                <div className="inline-block bg-secondary px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-muted-foreground ml-2">ParkIT AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm bg-white text-black"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me about parking systems..."
              disabled={isChatLoading}
            />
            <Button size="sm" onClick={handleSend} disabled={isChatLoading || !chatInput.trim()}>
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
