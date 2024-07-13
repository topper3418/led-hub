
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
  color: [number, number, number];
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

export interface fetchState extends baseFetchState {
  data: any;
}

export interface StripData extends baseFetchState {
  state: StripState;
  update: (newState: StripState) => void;
}

export interface AllDevicesData extends baseFetchState {
  devices: Device[];
}
