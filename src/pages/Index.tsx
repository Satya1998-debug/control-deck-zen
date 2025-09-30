import React, { useState } from "react";
import { DigitalTwinSection } from "@/components/dashboard/DigitalTwinSection";
import { DroneMissionsSection } from "@/components/dashboard/DroneMissionsSection";
import { WorkOrdersSection } from "@/components/dashboard/WorkOrdersSection";
import { ARRepairSection } from "@/components/dashboard/ARRepairSection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TemperatureSection } from "@/components/dashboard/TemperatureSection";

// Define mission interface
interface DroneMission {
  id: string;
  status: "Completed" | "In Progress" | "Scheduled";
  result: string;
  timestamp: string;
  location: string;
}

const Index = () => {
  // State for managing drone missions
  const [missions, setMissions] = useState<DroneMission[]>([
    {
      id: "#1",
      status: "Completed",
      result: "No critical issues",
      timestamp: "2 hours ago",
      location: "Building A - Level 3"
    },
    {
      id: "#2", 
      status: "In Progress",
      result: "Thermal anomaly detected",
      timestamp: "45 minutes ago",
      location: "External Perimeter"
    },
    {
      id: "#3",
      status: "Scheduled",
      result: "Pending execution",
      timestamp: "In 30 minutes",
      location: "Building B - Rooftop"
    }
  ]);

  // Function to add a new drone mission
  const addDroneMission = (location: string) => {
    const newMissionId = `#${missions.length + 1}`;
    const newMission: DroneMission = {
      id: newMissionId,
      status: "In Progress",
      result: "Inspection in progress...",
      timestamp: "Now",
      location: location
    };
    
    setMissions(prevMissions => [newMission, ...prevMissions]);
    
    // After 25 seconds, update the mission to "Completed"
    setTimeout(() => {
      setMissions(prevMissions => 
        prevMissions.map(mission => 
          mission.id === newMissionId 
            ? { ...mission, status: "Completed" as const, result: "Inspection completed - Ready for diagnosis", timestamp: "Just now" }
            : mission
        )
      );
    }, 25000);
  };
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Top Section - Digital Twin */}
        <DigitalTwinSection onCreateMission={addDroneMission} />
        
        {/* Temperature Monitoring Section */}
        <TemperatureSection />
        
        {/* Middle Section - Missions and Work Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DroneMissionsSection missions={missions} />
          </div>
          <div>
            <WorkOrdersSection />
          </div>
        </div>
        <ARRepairSection />
        
        {/* Bottom Section - AR Repair */}
      </main>
    </div>
  );
};

export default Index;