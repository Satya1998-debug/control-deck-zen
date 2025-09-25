import { ModernDashboardHeader } from "@/components/modern/ModernDashboardHeader";
import { AssetOverviewGrid } from "@/components/modern/AssetOverviewGrid";
import { LiveMonitoringPanel } from "@/components/modern/LiveMonitoringPanel";
import { OperationsCenter } from "@/components/modern/OperationsCenter";
import { SystemFlowDiagram } from "@/components/modern/SystemFlowDiagram";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <ModernDashboardHeader />
      
      <main className="container mx-auto p-8 space-y-8">
        {/* Asset Overview Cards */}
        <AssetOverviewGrid />
        
        {/* Live Monitoring and Operations */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-3">
            <LiveMonitoringPanel />
          </div>
          <div className="xl:col-span-2">
            <OperationsCenter />
          </div>
        </div>
        
        {/* System Flow */}
        <SystemFlowDiagram />
      </main>
    </div>
  );
};

export default Index;