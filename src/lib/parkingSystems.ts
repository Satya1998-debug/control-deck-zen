// Example mock health status API for parking systems
export type ParkingSystemHealth = "healthy" | "warning" | "critical";

export interface ParkingSystem {
  id: string;
  name: string;
  health: ParkingSystemHealth;
}

export const getParkingSystems = async (): Promise<ParkingSystem[]> => {
  // In a real app, fetch from API
  return [
    { id: "Aps1", name: "Parking System A", health: "healthy" },
    { id: "Aps2", name: "Parking System B", health: "warning" },
  ];
};
