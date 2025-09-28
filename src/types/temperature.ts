export interface TemperatureReading {
  time: string;
  principal: string;
  model_id: string;
  join_id: string | null;
  battery_v: number;
  battery_status: string;
  humidity: number;
  temperature_0: number;
  temperature_1: number;
  received_at: string;
  source_file: string;
  source_path: string;
  timestamp: string;
}

export interface TemperatureApiResponse {
  data: TemperatureReading[];
}