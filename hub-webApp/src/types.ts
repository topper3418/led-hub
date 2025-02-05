
export interface ledCardInterface {
  ledStrip: Device;
  selectDevice: () => void;
}

export interface Device {
  id: number;
  mac: string;
  name: string;
  current_ip: string;
  on: boolean;
  brightness: number;
  color: Color;
  connected: boolean;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface StripState {
  color: Color;
  on: boolean;
  brightness: number;
}

export interface SoftStripState {
  color?: Color;
  on?: boolean;
  brightness?: number;
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
    update: (newState: SoftStripState) => void;
    refetch: () => void;
    delete: () => void;
  }
}

export interface AllDevicesData extends baseFetchState {
  devices: Device[];
}
