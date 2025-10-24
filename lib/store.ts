import { create } from 'zustand';

interface User {
  uid: string;
  email: string;
  role: 'farmer' | 'admin';
  farmId?: string;
  displayName?: string;
}

interface SensorData {
  ammonia: number;
  co2: number;
  temperature: number;
  tds: number;
  humidity: number;
  timestamp: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface SensorStore {
  currentData: SensorData | null;
  historicalData: SensorData[];
  setCurrentData: (data: SensorData) => void;
  addHistoricalData: (data: SensorData) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export const useSensorStore = create<SensorStore>((set) => ({
  currentData: null,
  historicalData: [],
  setCurrentData: (data) => set({ currentData: data }),
  addHistoricalData: (data) =>
    set((state) => ({
      historicalData: [...state.historicalData.slice(-50), data], // Keep last 50 readings
    })),
}));
