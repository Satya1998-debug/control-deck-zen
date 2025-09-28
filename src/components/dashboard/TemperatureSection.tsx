import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Zap, Droplets } from "lucide-react";
import { useTemperatureData } from "@/hooks/useTemperatureData";
import { MetricChart } from "@/components/dashboard/MetricChart";

export const TemperatureSection = () => {
  const { data: temperatureResponse, isLoading, isError, error } = useTemperatureData();

  // Extract the latest reading and historical data for charts
  const latestReading = temperatureResponse?.data?.[temperatureResponse.data.length - 1];
  
  // Create arrays of recent temperature values for the chart
  const temperature0Values = temperatureResponse?.data?.map(reading => reading.temperature_0) || [];
  const temperature1Values = temperatureResponse?.data?.map(reading => reading.temperature_1) || [];
  const humidityValues = temperatureResponse?.data?.map(reading => reading.humidity) || [];
  const batteryValues = temperatureResponse?.data?.map(reading => reading.battery_v) || [];

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Temperature Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading temperature data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Temperature Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">
              Error loading temperature data: {error?.message || 'Unknown error'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Temperature Monitoring
          </CardTitle>
          
          <div className="flex items-center gap-4">
            {latestReading && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sensor:</span>
                  <Badge variant="outline">{latestReading.model_id}</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge 
                    variant={latestReading.battery_v > 3.0 ? "default" : "destructive"}
                  >
                    {latestReading.battery_v > 3.0 ? "Online" : "Low Battery"}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {latestReading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Temperature 0 */}
            <Card className="bg-secondary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Temperature 0</span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-3">
                  {latestReading.temperature_0?.toFixed(1) || '--'}°C
                </div>
                <MetricChart data={temperature0Values} color="hsl(var(--chart-1))" />
              </CardContent>
            </Card>

            {/* Temperature 1 */}
            <Card className="bg-secondary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Temperature 1</span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-3">
                  {latestReading.temperature_1?.toFixed(1) || '--'}°C
                </div>
                <MetricChart data={temperature1Values} color="hsl(var(--chart-2))" />
              </CardContent>
            </Card>

            {/* Humidity */}
            <Card className="bg-secondary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Humidity</span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-3">
                  {latestReading.humidity?.toFixed(1) || '--'}%
                </div>
                <MetricChart data={humidityValues} color="hsl(var(--chart-3))" />
              </CardContent>
            </Card>

            {/* Battery Voltage */}
            <Card className="bg-secondary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Battery</span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-3">
                  {latestReading.battery_v?.toFixed(2) || '--'}V
                </div>
                <MetricChart data={batteryValues} color="hsl(var(--chart-4))" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No temperature data available</div>
          </div>
        )}

        {latestReading && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-secondary/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Sensor Information</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Principal: </span>
                    <span className="font-mono text-xs">{latestReading.principal}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model: </span>
                    <span>{latestReading.model_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Battery Status: </span>
                    <Badge variant="outline">{latestReading.battery_status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Latest Reading</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Time: </span>
                    <span>{new Date(latestReading.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Received: </span>
                    <span>{new Date(latestReading.received_at).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};