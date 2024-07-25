import { useState, useEffect } from "react";

class StripState {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string>>;
  color: { r: number; g: number; b: number };
  setColor: React.Dispatch<React.SetStateAction<{ r: number; g: number; b: number }>>;
  on: boolean;
  setOn: React.Dispatch<React.SetStateAction<boolean>>;
  brightness: number;
  setBrightness: React.Dispatch<React.SetStateAction<number>>;
  constructor() {
    [this.loading, this.setLoading] = useState(true);
    [this.error, this.setError] = useState("");
    [this.color, this.setColor] = useState({ r: 0, g: 0, b: 0 });
    [this.on, this.setOn] = useState(false);
    [this.brightness, this.setBrightness] = useState(0);
  }
}

interface ledStripInterface {



export const useStripData = (url: string): StripState => {
  const state = new StripState();
  useEffect(() => {
    state.setLoading(true);
    fetch(url)
      .then((res: Response) => {
        if (!res.ok) {
          throw new Error(
            "Request failed, status: " +
            res.status +
            " " +
            res.statusText
          );
        }
        return res.json();
      })
      .then((data) => {
        const [r, g, b] = data.color;
        state.setColor({ r: parseInt(r), g: parseInt(g), b: parseInt(b) });
        state.setOn(data.on);
        state.setBrightness(Math.round((data.brightness * 10) / 255));
      })
      .catch((err) => {
        state.setError(err);
        console.error(err);
      })
      .finally(() => {
        state.setLoading(false);
      });
  }, []);
  return state;
}
