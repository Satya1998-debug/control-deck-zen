import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import InspectionSection from "../components/dashboard/InspectionSection";

const healthColor = {
  healthy: "bg-green-400 hover:bg-green-500 border-green-600",
  warning: "bg-yellow-400 hover:bg-yellow-500 border-yellow-600",
  critical: "bg-red-500 hover:bg-red-600 border-red-700",
};

const iconByHealth = {
  healthy: <CheckCircle2 className="w-6 h-6 text-green-500 mr-2" />,
  warning: <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />,
  critical: <AlertTriangle className="w-6 h-6 text-red-600 mr-2 animate-pulse" />,
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate 8 parking systems with different health statuses
    setSystems([
      { id: "Aps1", name: "Parking System A", health: "healthy" },
      { id: "Aps2", name: "Parking System B", health: "warning" },
      { id: "Aps3", name: "Parking System C", health: "critical" },
      { id: "Aps4", name: "Parking System D", health: "healthy" },
      { id: "Aps5", name: "Parking System E", health: "warning" },
      { id: "Aps6", name: "Parking System F", health: "healthy" },
      { id: "Aps7", name: "Parking System G", health: "warning" },
      { id: "Aps8", name: "Parking System H", health: "critical" },
    ]);
    setLoading(false);
  }, []);

  // Example: mock status details for demo
  const statusDetails: Record<string, { status: string; issues: string; lastChecked: string }> = {
    Aps1: {
      status: "All systems operational.",
      issues: "No issues detected.",
      lastChecked: "Just now",
    },
    Aps2: {
      status: "Elevator 2 slow response.",
      issues: "1 warning: Maintenance required soon.",
      lastChecked: "2 min ago",
    },
    Aps3: {
      status: "Gate sensor offline.",
      issues: "Critical: Sensor replacement needed.",
      lastChecked: "5 min ago",
    },
    Aps4: {
      status: "Routine maintenance scheduled.",
      issues: "No active issues.",
      lastChecked: "10 min ago",
    },
    Aps5: {
      status: "Power fluctuation detected.",
      issues: "Warning: Check power supply.",
      lastChecked: "1 min ago",
    },
    Aps6: {
      status: "All systems operational.",
      issues: "No issues detected.",
      lastChecked: "Just now",
    },
    Aps7: {
      status: "Software update available.",
      issues: "Warning: Update recommended.",
      lastChecked: "3 min ago",
    },
    Aps8: {
      status: "Camera feed lost.",
      issues: "Critical: Camera offline.",
      lastChecked: "7 min ago",
    },
  };

  // Calculate overall system health summary
  const healthyCount = systems.filter((s) => s.health === "healthy").length;
  const warningCount = systems.filter((s) => s.health === "warning").length;
  const criticalCount = systems.filter((s) => s.health === "critical").length;
  const onlineCount = systems.length - criticalCount;

  const filteredSystems = filter === "all"
    ? systems
    : systems.filter((s) => s.health === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 flex flex-col items-center justify-center">
      <main className="container mx-auto p-6 flex flex-col items-center justify-center min-h-screen">
        {/* Inspection Section - Drone Image */}
        <InspectionSection />
        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-800 rounded-full p-4 mb-4 shadow-lg flex items-center justify-center w-32 h-32 overflow-hidden">
            <img
              src="/Gemini_Generated_Image_snk50jsnk50jsnk5.png"
              alt="Puzzle Parking Illustration"
              className="object-cover w-24 h-24 md:w-28 md:h-28 rounded-full drop-shadow"
              style={{ aspectRatio: '1/1' }}
            />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
            Puzzle Parking Control Center
          </h1>
          <p className="mb-8 text-slate-300 text-center max-w-2xl text-lg">
            Monitor, manage, and respond to your automated parking systems in real time.
          </p>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mt-2">
            <Sparkles className="w-4 h-4 animate-bounce" />
            Technician Quick Overview
          </div>
        </div>
        {/* Move Overall System Health Summary to the top right */}
        <div className="absolute top-8 right-8 z-20 bg-slate-800/90 rounded-xl px-6 py-3 shadow-lg border border-slate-700 flex flex-col items-end max-w-xs">
          <div className="text-base font-bold text-white mb-1 flex items-center gap-2">
            Overall Status:
            <span className="inline-flex items-center gap-1 font-semibold">
              {filteredSystems.length - filteredSystems.filter((s) => s.health === "critical").length}/{filteredSystems.length} Online
            </span>
          </div>
          <div className="flex gap-2 text-xs text-slate-200">
            <span>{filteredSystems.filter((s) => s.health === "healthy").length} Healthy</span>
            <span>{filteredSystems.filter((s) => s.health === "warning").length} Warning</span>
            <span>{filteredSystems.filter((s) => s.health === "critical").length} Critical</span>
          </div>
        </div>
        {loading ? (
          <div className="text-muted-foreground">Loading systems...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
              <button
                className={`px-5 py-2 rounded-full border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition shadow ${filter === "all" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`px-5 py-2 rounded-full border border-green-700 bg-slate-800 text-green-300 hover:bg-green-900/30 transition shadow ${filter === "healthy" ? "ring-2 ring-green-500" : ""}`}
                onClick={() => setFilter("healthy")}
              >
                Healthy
              </button>
              <button
                className={`px-5 py-2 rounded-full border border-yellow-700 bg-slate-800 text-yellow-200 hover:bg-yellow-900/30 transition shadow ${filter === "warning" ? "ring-2 ring-yellow-400" : ""}`}
                onClick={() => setFilter("warning")}
              >
                Warning
              </button>
              <button
                className={`px-5 py-2 rounded-full border border-red-700 bg-slate-800 text-red-300 hover:bg-red-900/30 transition shadow ${filter === "critical" ? "ring-2 ring-red-500" : ""}`}
                onClick={() => setFilter("critical")}
              >
                Critical
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
              {filteredSystems.map((system) => (
                <div
                  key={system.id}
                  className={`relative group rounded-2xl border-l-4 shadow-xl border-slate-700 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-950 p-6 flex flex-col items-center transition hover:shadow-blue-900 ${
                    system.health === "healthy"
                      ? "border-l-green-500"
                      : system.health === "warning"
                      ? "border-l-yellow-400"
                      : "border-l-red-600 ring-4 ring-red-500/60 bg-red-900/40"
                  }`}
                >
                  {/* Critical badge */}
                  {system.health === "critical" && (
                    <div className="absolute -top-3 -left-3 bg-red-700 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg z-20 border-2 border-red-400">
                      CRITICAL
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white border border-slate-600 shadow flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full inline-block ${
                      system.health === "healthy"
                        ? "bg-green-500"
                        : system.health === "warning"
                        ? "bg-yellow-400"
                        : "bg-red-600"
                    }`}></span>
                    {system.health.charAt(0).toUpperCase() + system.health.slice(1)}
                  </div>
                  {iconByHealth[system.health]}
                  <h2 className="text-xl font-bold text-white mb-1 mt-2 text-center">
                    {system.name}
                  </h2>
                  <p className="text-slate-300 text-sm mb-2 text-center">
                    {statusDetails[system.id]?.status || "Status unknown."}
                  </p>
                  <button
                    className="bg-slate-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-xl mt-4 w-full transition"
                    onClick={() => navigate(`/${system.id}`)}
                    aria-label={`Go to ${system.name}`}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
