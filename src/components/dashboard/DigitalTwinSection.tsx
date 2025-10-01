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

// Interface for vibration response
interface VibrationData {
  sensor_id: string;
  vibration_magnitude: number;
  time: string;
}

interface VibrationApiResponse {
  data: VibrationData[];
  count: number;
  message: string;
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

  // State for vibration alarm
  const [vibrationAlarmActive, setVibrationAlarmActive] = useState(false);
  const [vibrationAlarmTriggered, setVibrationAlarmTriggered] = useState(false);
  const [screenFlashing, setScreenFlashing] = useState(false);
  const [alarmTimer, setAlarmTimer] = useState<NodeJS.Timeout | null>(null);

  // State for platform speed control
  const [isDecreasingSpeed, setIsDecreasingSpeed] = useState(false);
  const [speedDecreaseError, setSpeedDecreaseError] = useState<string | null>(null);

  // State for double space key press detection
  const [lastSpacePress, setLastSpacePress] = useState<number>(0);
  const [spaceKeyTimeout, setSpaceKeyTimeout] = useState<NodeJS.Timeout | null>(null);
  const [spaceDebugMessage, setSpaceDebugMessage] = useState<string>("");
  
  // Audio context reference for persistent audio
  const audioContextRef = useRef<AudioContext | null>(null);
  // Track whether audio is unlocked/running
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  // Prevent multiple overlapping alarm loops
  const alarmLoopActiveRef = useRef<boolean>(false);

  // Risk calculation functions
  const calculateRiskStates = () => {
    // Parse current temperature value
    const currentTemp = parseFloat(temperatureValue.replace('°C', '')) || 0;
    
    // Parse current vibration value (extract numeric part from "X.XX mm/sec")
    const currentVibration = parseFloat(vibrationValue.replace(' mm/sec', '').replace('--', '0')) || 0;
    
    console.log('Checking vibration threshold:', {
      vibrationValue,
      currentVibration,
      threshold: 5.0,
      exceedsThreshold: currentVibration > 5.0,
      alreadyTriggered: vibrationAlarmTriggered
    });
    
    // Check for temperature fault (threshold: >300°C)
    const tempFault = currentTemp > 300;
    
    // Check for vibration fault (threshold: >2.0 mm/sec indicates high vibration)
    const vibrationFault = currentVibration > 2.0;
    
    // Vibration alarm threshold (threshold: >5.0 mm/sec triggers alarm)
    const vibrationAlarm = currentVibration > 5.0;
    
    // Trigger alarm if vibration exceeds threshold and not already triggered
    if (vibrationAlarm && !vibrationAlarmTriggered) {
      console.log('🚨 TRIGGERING VIBRATION ALARM - Vibration:', currentVibration, 'mm/sec');
      triggerVibrationAlarm();
    } else if (!vibrationAlarm && vibrationAlarmTriggered) {
      // Reset alarm state when vibration goes back to normal
      console.log('✅ Vibration back to normal - Resetting alarm state');
      setVibrationAlarmTriggered(false);
      setVibrationAlarmActive(false);
      setScreenFlashing(false);
      alarmLoopActiveRef.current = false; // Stop audio loop
    }
    
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
      vibrationAlarm,
      crackDetected,
      dirtDetected
    };
  };

  // Function to initialize audio context with user interaction
  const initializeAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('🔊 Audio context created successfully');
        // Reflect state changes in UI
        audioContextRef.current.onstatechange = () => {
          const running = audioContextRef.current?.state === 'running';
          console.log('🎚️ AudioContext state changed:', audioContextRef.current?.state);
          setAudioUnlocked(!!running);
        };
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('🔊 Audio context resumed');
      }

      // Perform a tiny, silent ping to fully unlock on some browsers (no audible output)
      try {
        const ctx = audioContextRef.current;
        const g = ctx.createGain();
        g.gain.value = 0.0001;
        const o = ctx.createOscillator();
        o.frequency.value = 100;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.01);
      } catch (e) {
        // Ignore if not permitted; this is best-effort
      }
      
      setAudioUnlocked(audioContextRef.current.state === 'running');
      return audioContextRef.current;
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      return null;
    }
  };

  // Fallback audio method using multiple approaches (shared)
  const playFallbackAudioLoop = () => {
    console.log('🔄 Trying fallback audio methods...');

    const generateSirenAudio = (frequency: number, duration: number) => {
      const sampleRate = 44100;
      const samples = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);

      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);

      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const currentFreq = frequency + (frequency * 0.8 * Math.sin(2 * Math.PI * t * 0.5));
        const sample = Math.sin(2 * Math.PI * currentFreq * t) * 0.8 * Math.exp(-t * 0.1);
        view.setInt16(44 + i * 2, sample * 32767, true);
      }

      return new Blob([buffer], { type: 'audio/wav' });
    };

    const trySimpleBeep = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
        console.log('✅ Simple beep fallback played');
        if (screenFlashing) setTimeout(trySimpleBeep, 1000);
      } catch (error) {
        console.log('❌ All audio methods failed:', error);
      }
    };

    const playFallbackSiren = () => {
      if (!screenFlashing) { alarmLoopActiveRef.current = false; return; }
      try {
        const sirenBlob = generateSirenAudio(400, 2.0);
        const audio = new Audio(URL.createObjectURL(sirenBlob));
        audio.volume = 0.8;
        audio.play().then(() => {
          console.log('✅ Fallback siren played successfully');
        }).catch((error) => {
          console.log('❌ Fallback audio failed:', error);
          trySimpleBeep();
        });
        audio.addEventListener('ended', () => URL.revokeObjectURL(audio.src));
      } catch (error) {
        console.log('❌ Fallback siren generation failed:', error);
        trySimpleBeep();
      }
      if (screenFlashing) setTimeout(playFallbackSiren, 3000);
      else alarmLoopActiveRef.current = false;
    };

    // Start fallback loop; guard multiple
    if (alarmLoopActiveRef.current) return;
    alarmLoopActiveRef.current = true;
    playFallbackSiren();
  };

  // Primary siren loop using Web Audio API (shared)
  const playAlarmAudioLoop = async () => {
    if (!screenFlashing) return; // only when alarm active
    if (alarmLoopActiveRef.current) { console.log('ℹ️ Siren loop already running'); return; }
    alarmLoopActiveRef.current = true;

    try {
      console.log('🚨 Starting alarm sound...');
      let audioContext = audioContextRef.current;
      if (!audioContext) audioContext = await initializeAudioContext();
      if (!audioContext) { console.error('❌ No AudioContext, using fallback'); playFallbackAudioLoop(); return; }
      if (audioContext.state === 'suspended') {
        try { await audioContext.resume(); } catch {}
      }
      if (audioContext.state !== 'running') {
        console.warn('⚠️ AudioContext not running, using fallback');
        playFallbackAudioLoop();
        return;
      }
      console.log('✅ Audio context ready, playing tsunami siren');

      const createPowerfulTsunamiSiren = (frequency: number, duration: number, volume: number, delay: number = 0) => {
        setTimeout(() => {
          // Double-check alarm status before creating oscillator
          if (!screenFlashing || !alarmLoopActiveRef.current) return; // Stop if alarm is no longer active
          try {
            const oscillator = audioContext!.createOscillator();
            const gainNode = audioContext!.createGain();
            const filterNode = audioContext!.createBiquadFilter();
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(audioContext!.destination);
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(frequency, audioContext!.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 2.5, audioContext!.currentTime + duration / 3);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.2, audioContext!.currentTime + (duration * 2) / 3);
            oscillator.frequency.exponentialRampToValueAtTime(frequency, audioContext!.currentTime + duration);
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(2000, audioContext!.currentTime);
            filterNode.frequency.exponentialRampToValueAtTime(4000, audioContext!.currentTime + duration / 2);
            filterNode.frequency.exponentialRampToValueAtTime(1000, audioContext!.currentTime + duration);
            filterNode.Q.setValueAtTime(5, audioContext!.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext!.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(volume, audioContext!.currentTime + 0.05);
            gainNode.gain.setValueAtTime(volume, audioContext!.currentTime + duration - 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + duration);
            oscillator.start(audioContext!.currentTime);
            oscillator.stop(audioContext!.currentTime + duration);
            console.log(`🎵 Playing powerful siren: ${frequency}Hz for ${duration}s at volume ${volume}`);
          } catch (error) {
            console.log('❌ Error creating siren tone:', error);
          }
        }, delay);
      };

      const loop = () => {
        if (!screenFlashing || !alarmLoopActiveRef.current) { 
          alarmLoopActiveRef.current = false; 
          console.log('🔇 Stopping siren - alarm deactivated'); 
          return; 
        }
        console.log('🌊 Playing POWERFUL tsunami siren pattern...');
        const powerfulTsunamiPattern = [
          { frequency: 150, duration: 3.0, volume: 0.9, delay: 0 },
          { frequency: 250, duration: 2.5, volume: 0.8, delay: 800 },
          { frequency: 400, duration: 2.0, volume: 0.9, delay: 1600 },
          { frequency: 180, duration: 2.5, volume: 0.7, delay: 2400 },
        ];
        powerfulTsunamiPattern.forEach(({ frequency, duration, volume, delay }) => {
          createPowerfulTsunamiSiren(frequency, duration, volume, delay);
        });
        setTimeout(loop, 5000);
      };
      loop();
    } catch (error) {
      console.log('❌ Enhanced audio failed:', error);
      playFallbackAudioLoop();
    }
  };

  // Initialize audio context on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      console.log('👆 User interaction detected, initializing audio...');
      await initializeAudioContext();
      setAudioUnlocked(audioContextRef.current?.state === 'running');
      // If alarm is active but silent, start the siren now
      if (audioContextRef.current?.state === 'running' && vibrationAlarmActive && vibrationAlarmTriggered) {
        playAlarmAudioLoop();
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    // Listen for any user interaction to initialize audio
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // If audio gets unlocked later while alarm is active, ensure audio starts
  useEffect(() => {
    if (audioUnlocked && vibrationAlarmActive && vibrationAlarmTriggered) {
      playAlarmAudioLoop();
    }
  }, [audioUnlocked, vibrationAlarmActive, vibrationAlarmTriggered]);

  // Function to trigger vibration alarm
  const triggerVibrationAlarm = () => {
    if (!vibrationAlarmTriggered) {
      setVibrationAlarmTriggered(true);
      setVibrationAlarmActive(true);
      setScreenFlashing(true);
    }

    // Clear any existing alarm timer
    if (alarmTimer) {
      clearTimeout(alarmTimer);
    }

    // Start siren audio (guarded internally)
    playAlarmAudioLoop();
  };

  // Function to decrease platform speed
  const handleDecreaseSpeed = async () => {
    // STOP THE ALARM FIRST when user clicks decrease speed
    setVibrationAlarmActive(false);
    setScreenFlashing(false);
    setVibrationAlarmTriggered(false);
    alarmLoopActiveRef.current = false;
    
    // Clear any alarm timer
    if (alarmTimer) {
      clearTimeout(alarmTimer);
      setAlarmTimer(null);
    }
    
    // Then proceed with the original speed decrease functionality
    setIsDecreasingSpeed(true);
    setSpeedDecreaseError(null);
    
    try {
      console.log('Decreasing platform speed...');
      const response = await axios.get('http://localhost:8000/api/decrease');
      console.log('Speed decrease response:', response.data);
      
      // Fetch updated vibration data immediately after speed decrease
      setTimeout(() => {
        fetchVibrationData();
      }, 1000); // Wait 1 second for the change to take effect
      
    } catch (error) {
      console.error('Error decreasing platform speed:', error);
      
      let errorMessage = 'Failed to decrease platform speed';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Unknown server error'}`;
        } else if (error.request) {
          errorMessage = 'Network Error: Could not connect to the server';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setSpeedDecreaseError(errorMessage);
    } finally {
      setIsDecreasingSpeed(false);
    }
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
        // Remove humidity-based vibration update - now handled by fetchVibrationData()

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
        // Remove humidity-based vibration data update - now handled by fetchVibrationData()
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

  // Function to fetch vibration data from backend
  const fetchVibrationData = async () => {
    try {
      const response = await axios.get<VibrationApiResponse>('http://localhost:8000/api/vibration');
      console.log('Vibration data response:', response.data);
      
      if (response.data.data && response.data.data.length > 0) {
        // Extract vibration magnitudes for the chart
        const vibrationMagnitudes = response.data.data.map(reading => reading.vibration_magnitude);
        
        // Get the latest vibration reading
        const latestReading = response.data.data[response.data.data.length - 1];
        
        // Update vibration data
        setVibrationData(vibrationMagnitudes.slice(-10)); // Keep last 10 readings
        setVibrationValue(`${latestReading.vibration_magnitude.toFixed(2)} mm/sec`); // Set with 'mm/sec' unit
        
        console.log('📊 VIBRATION DATA UPDATE:', {
          latestMagnitude: latestReading.vibration_magnitude,
          formattedValue: `${latestReading.vibration_magnitude.toFixed(2)} mm/sec`,
          exceedsThreshold: latestReading.vibration_magnitude > 5.0,
          allMagnitudes: vibrationMagnitudes
        });
        console.log('Updated vibration data:', vibrationMagnitudes);
        console.log('Latest vibration value:', latestReading.vibration_magnitude);
      }
    } catch (error) {
      console.error('Error fetching vibration data:', error);
      // Keep existing humidity-based vibration as fallback
    }
  };

  // Setup polling with different intervals
  useEffect(() => {
    // Initial fetch for all APIs
    fetchTemperatureData();
    fetchBatteryStatus();
    fetchVibrationData();

    console.log(temperatureData);
    
    // Set up interval for temperature and vibration every 5 seconds
    const tempVibrationInterval = setInterval(() => {
      fetchTemperatureData();
      fetchVibrationData();
    }, 5000); // 5 seconds

    // Set up interval for battery status every 1 minute
    const batteryInterval = setInterval(() => {
      fetchBatteryStatus();
    }, 60000); // 1 minute

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(tempVibrationInterval);
      clearInterval(batteryInterval);
    };
  }, []);

  // Monitor vibration value changes for automatic alarm triggering
  useEffect(() => {
    if (vibrationValue && vibrationValue !== "--") {
      // Parse vibration value and check threshold
      const currentVibration = parseFloat(vibrationValue.replace(' mm/sec', '').replace('--', '0')) || 0;
      
      console.log('🔍 AUTOMATIC TRIGGER CHECK:', {
        vibrationValue,
        currentVibration,
        threshold: 5.0,
        exceedsThreshold: currentVibration > 5.0,
        alreadyTriggered: vibrationAlarmTriggered,
        screenFlashing,
        vibrationAlarmActive
      });
      
      // Trigger alarm if vibration exceeds threshold and not already triggered
      if (currentVibration > 5.0 && !vibrationAlarmTriggered) {
        console.log('🚨 AUTO-TRIGGERING VIBRATION ALARM - Vibration:', currentVibration, 'mm/sec');
        try {
          triggerVibrationAlarm();
          console.log('✅ Auto-trigger function called successfully');
        } catch (error) {
          console.error('❌ Error in auto-trigger:', error);
        }
      } else if (currentVibration <= 5.0 && vibrationAlarmTriggered) {
        // Reset alarm state when vibration goes back to normal
        console.log('✅ Vibration back to normal - Resetting alarm state');
        setVibrationAlarmTriggered(false);
        setVibrationAlarmActive(false);
        setScreenFlashing(false);
        alarmLoopActiveRef.current = false; // Stop audio loop
      }
    } else {
      console.log('⚠️ Vibration value is empty or "--":', vibrationValue);
    }
  }, [vibrationValue, vibrationAlarmTriggered, triggerVibrationAlarm]);

  // Handle double space key press to manually trigger siren
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      // Check if space key is pressed
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault(); // Prevent page scrolling
        
        const currentTime = Date.now();
        const timeSinceLastPress = currentTime - lastSpacePress;
        
        console.log('🔧 Space key pressed:', {
          timeSinceLastPress,
          currentTime,
          lastSpacePress,
          withinDoubleClickWindow: timeSinceLastPress < 500,
          eventCode: event.code,
          eventKey: event.key
        });
        
        // Show visual feedback for debugging
        document.body.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        setTimeout(() => {
          document.body.style.backgroundColor = '';
        }, 200);
        
        // Update debug message
        setSpaceDebugMessage(`Space pressed at ${new Date().toLocaleTimeString()}`);
        setTimeout(() => setSpaceDebugMessage(""), 2000);
        
        // If less than 500ms since last space press, it's a double press
        if (timeSinceLastPress < 500 && timeSinceLastPress > 50) { // 50ms minimum to avoid accidental triggers
          console.log('🚨 Crack Increase DETECTED! Triggering siren...!');
          
          // Show visual feedback for double space detection
          document.body.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
          setTimeout(() => {
            document.body.style.backgroundColor = '';
          }, 1000);
          
          // Update debug message for double space
          setSpaceDebugMessage(`🚨 Crack Increase DETECTED! Triggering siren...`);
          setTimeout(() => setSpaceDebugMessage(""), 3000);
          
          // Clear any existing timeout
          if (spaceKeyTimeout) {
            clearTimeout(spaceKeyTimeout);
            setSpaceKeyTimeout(null);
          }
          
          // Reset the vibration alarm trigger to allow manual activation
          setVibrationAlarmTriggered(false);
          
          // Trigger the vibration alarm manually and play siren directly
          setTimeout(() => {
            console.log('⚡ Calling triggerVibrationAlarm()');
            triggerVibrationAlarm();
            
            // Also call createPowerfulTsunamiSiren directly for immediate testing
            if (audioContextRef.current && audioContextRef.current.state === 'running') {
              const createPowerfulTsunamiSiren = (frequency: number, duration: number, volume: number, delay: number = 0) => {
                setTimeout(() => {
                  if (!audioContextRef.current || audioContextRef.current.state !== 'running') return;
                  try {
                    const oscillator = audioContextRef.current.createOscillator();
                    const gainNode = audioContextRef.current.createGain();
                    const filterNode = audioContextRef.current.createBiquadFilter();
                    oscillator.connect(filterNode);
                    filterNode.connect(gainNode);
                    gainNode.connect(audioContextRef.current.destination);
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(frequency * 2.5, audioContextRef.current.currentTime + duration / 3);
                    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.2, audioContextRef.current.currentTime + (duration * 2) / 3);
                    oscillator.frequency.exponentialRampToValueAtTime(frequency, audioContextRef.current.currentTime + duration);
                    filterNode.type = 'lowpass';
                    filterNode.frequency.setValueAtTime(2000, audioContextRef.current.currentTime);
                    filterNode.frequency.exponentialRampToValueAtTime(4000, audioContextRef.current.currentTime + duration / 2);
                    filterNode.frequency.exponentialRampToValueAtTime(1000, audioContextRef.current.currentTime + duration);
                    filterNode.Q.setValueAtTime(5, audioContextRef.current.currentTime);
                    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.05);
                    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime + duration - 0.3);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
                    oscillator.start(audioContextRef.current.currentTime);
                    oscillator.stop(audioContextRef.current.currentTime + duration);
                    console.log(`🎵 Direct siren test: ${frequency}Hz for ${duration}s at volume ${volume}`);
                  } catch (error) {
                    console.log('❌ Error in direct siren test:', error);
                  }
                }, delay);
              };
              
              // Play a test siren pattern immediately
              createPowerfulTsunamiSiren(400, 2.0, 0.8, 0);
              createPowerfulTsunamiSiren(200, 1.5, 0.6, 500);
            }
          }, 100);
          
          // Reset the last press time to prevent triple-press issues
          setLastSpacePress(0);
        } else {
          // First space press - set timer and wait for potential second press
          setLastSpacePress(currentTime);
          
          // Clear any existing timeout
          if (spaceKeyTimeout) {
            clearTimeout(spaceKeyTimeout);
          }
          
          // Set timeout to reset after 500ms if no second press
          const timeout = setTimeout(() => {
            setLastSpacePress(0);
            setSpaceKeyTimeout(null);
          }, 500);
          
          setSpaceKeyTimeout(timeout);
        }
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (spaceKeyTimeout) {
        clearTimeout(spaceKeyTimeout);
      }
    };
  }, [lastSpacePress, spaceKeyTimeout, triggerVibrationAlarm]);

  // Cleanup inspection timer on component unmount
  useEffect(() => {
    return () => {
      if (inspectionTimer) {
        clearTimeout(inspectionTimer);
      }
      if (alarmTimer) {
        clearTimeout(alarmTimer);
      }
      if (spaceKeyTimeout) {
        clearTimeout(spaceKeyTimeout);
      }
    };
  }, [inspectionTimer, alarmTimer, spaceKeyTimeout]);

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
      unit: "mm/sec" // Changed unit to mm/sec for vibration magnitude
    },
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
      {/* Screen Flash Overlay for Vibration Alarm */}
      {screenFlashing && (
        <div 
          className="fixed inset-0 z-[9999] pointer-events-none animate-pulse"
          style={{
            backgroundColor: screenFlashing ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
            animation: 'flash 0.5s infinite'
          }}
        >
          <style>{`
            @keyframes flash {
              0%, 50% { background-color: rgba(255, 0, 0, 0.4) !important; }
              25%, 75% { background-color: rgba(255, 255, 255, 0.4) !important; }
            }
          `}</style>
        </div>
      )}
      
      {/* Vibration Alarm Banner */}
      {vibrationAlarmActive && (
        <div className="fixed top-0 left-0 right-0 z-[9998] bg-red-600 text-white text-center py-3 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🚨</span>
            <span className="text-lg font-bold">CRITICAL VIBRATION ALARM - {vibrationValue}</span>
            <span className="text-2xl">🚨</span>
          </div>
          <div className="text-sm">System vibration exceeds safety threshold (&gt;5.0 mm/sec)</div>
        </div>
      )}

      {/* Audio unlock hint (clickable) */}
      {!audioUnlocked && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[9996] bg-black/80 text-white text-center py-2 px-3 cursor-pointer select-none"
          onClick={() => { initializeAudioContext(); }}
          title="Enable sound"
        >
          <span className="text-xs sm:text-sm">Sound is disabled by the browser until you interact. Click or press any key to enable.</span>
        </div>
      )}

      {/* Debug Banner for Space Key Detection */}
      {spaceDebugMessage && (
        <div className="fixed top-20 left-0 right-0 z-[9997] bg-red-600 text-white text-center py-2">
          <div className="text-sm">{spaceDebugMessage}</div>
          <div className="text-xs">Press space twice quickly to manually trigger siren</div>
        </div>
      )}

      <Card className={`${vibrationAlarmActive ? 'mt-20' : ''} shadow-lg`}>
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
                        <Button variant="outline" size="sm" className="w-full mb-2">
                          Export test case JSON
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs bg-blue-50 border-blue-300 text-blue-700"
                          onClick={handleDecreaseSpeed}
                          disabled={isDecreasingSpeed}
                        >
                          {isDecreasingSpeed ? '⏳ Decreasing...' : '🔽 Decrease Platform Speed'}
                        </Button>
                        {speedDecreaseError && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                            {speedDecreaseError}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 text-status-warning">Risk (derived)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {"Thresholds: T>300°C, V>2.0 mm/sec, Alarm>5.0 mm/sec, Crack (AT1), Dirt (AT3)"}
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
                          checked={riskStates.vibrationAlarm}
                          readOnly
                          className={`rounded ${riskStates.vibrationAlarm ? 'accent-red-500' : ''}`} 
                        />
                        <span className={`text-sm ${riskStates.vibrationAlarm ? 'text-red-600 font-bold animate-pulse' : ''}`}>
                          🚨 VIBRATION ALARM {riskStates.vibrationAlarm ? `(${vibrationValue})` : ''}
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
                      {(riskStates.tempFault || riskStates.vibrationFault || riskStates.vibrationAlarm || riskStates.crackDetected || riskStates.dirtDetected) && (
                        <Badge variant="destructive" className="text-xs">
                          {[
                            riskStates.tempFault && 'Temperature', 
                            riskStates.vibrationFault && 'Vibration', 
                            riskStates.vibrationAlarm && '🚨 ALARM',
                            riskStates.crackDetected && 'Crack', 
                            riskStates.dirtDetected && 'Dirt'
                          ].filter(Boolean).join(', ')} Alert
                        </Badge>
                      )}
                      {!riskStates.tempFault && !riskStates.vibrationFault && !riskStates.vibrationAlarm && !riskStates.crackDetected && !riskStates.dirtDetected && (
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
