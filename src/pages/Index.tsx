import { DigitalTwinSection } from "@/components/dashboard/DigitalTwinSection";
import { DroneMissionsSection } from "@/components/dashboard/DroneMissionsSection";
import { WorkOrdersSection } from "@/components/dashboard/WorkOrdersSection";
import { ARRepairSection } from "@/components/dashboard/ARRepairSection";
import { SwimLaneSection } from "@/components/dashboard/SwimLaneSection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Top Section - Digital Twin */}
        <DigitalTwinSection />
        
        {/* Middle Section - Missions and Work Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DroneMissionsSection />
          </div>
          <div>
            <WorkOrdersSection />
          </div>
        </div>
        
        {/* Bottom Section - AR Repair */}
        <ARRepairSection />
        
        {/* Event Flow */}
        <SwimLaneSection />
      </main>
    </div>
  );
};

export default Index;