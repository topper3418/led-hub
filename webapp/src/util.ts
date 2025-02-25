import { Device } from "./types";

export const formatDateString = (dateTimeString: string, includeDay: boolean = true) => {
  // Convert string to Date object
  const date = new Date(dateTimeString);

  // Format date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Return a concise date/time string
  if (includeDay) {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } else return `${hours}:${minutes}:${seconds}`;
};

export const intToHex = (value: number) => {
  // Clamp value to 0-255 range and convert to hex
  const clamped = Math.min(Math.max(value, 0), 255);
  return clamped.toString(16).padStart(2, "0").toUpperCase();
}

// Calculate luminance and return contrasting text color
export const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF'; // Black for light bg, white for dark bg
}

export const getDeviceIdentifier = (device: Device): string => {
  return device.name || device.mac || "Unknown Device";
}
