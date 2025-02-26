
export interface Device {
  id: number;
  mac: string;
  name: string;
  current_ip: string;
  last_ping: string;
  led_strip: LedStrip;
}

export interface Color {
  red: number;
  green: number;
  blue: number;
}

export interface LedStrip {
  id?: number;
  red?: number;
  green?: number;
  blue?: number;
  on?: boolean;
  brightness?: number;
}

export interface Room {
  id: number;
  name: string;
  devices?: Device[];
  ledStrips?: LedStrip;
}

export interface fetchStripResponse {
  color: [string, string, string];
  brightness: string;
  on: boolean;
}

export interface baseFetchState {
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
}

export interface fetchState {
  data: any;
  loading: boolean;
  error: string | undefined;
}

export interface AllStripData {
  state: fetchState;
  api: {
    refetch: () => void;
  }
}

export interface StripData {
  state: fetchState;
  api: {
    update: (newState: LedStrip) => void;
    refetch: () => void;
    delete: () => void;
  }
}

export interface AllDevicesData extends baseFetchState {
  devices: Device[];
}
