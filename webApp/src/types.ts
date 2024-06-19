
export interface ledCardInterface {
    ledStrip: Device;
    selectDevice: () => void;
}

export interface Device {
  id: number;
  mac: string;
  name: string;
  current_ip: string;
}

