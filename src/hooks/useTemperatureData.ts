import { useQuery } from '@tanstack/react-query';
import { TemperatureApiResponse } from '@/types/temperature';

const API_BASE_URL = 'http://localhost:8000'; // Update this to match your backend URL

export const useTemperatureData = () => {
  return useQuery<TemperatureApiResponse>({
    queryKey: ['temperature'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/temperature`);
      if (!response.ok) {
        throw new Error('Failed to fetch temperature data');
      }
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchIntervalInBackground: true,
    staleTime: 0, // Consider data immediately stale
    gcTime: 30000, // Keep data for 30 seconds
  });
};