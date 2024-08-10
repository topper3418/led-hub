import { useState, useEffect } from "react";
import { StripData, AllDevicesData, StripState, fetchStripResponse, fetchState } from "../types";
import axios, { AxiosResponse } from 'axios';

const defaultProcessJson = (data: fetchStripResponse) => data;

// base hook for fetching data. should probably refactor to a util module later
const useFetch = (
  url: string,
  processJson: (data: fetchStripResponse) => any = defaultProcessJson,
): fetchState => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [trigger, setTrigger] = useState(false);
  const [data, setData] = useState<any>(undefined);

  const refetch = () => setTrigger(!trigger);

  useEffect(() => {
    setLoading(true);
    axios.get(url)
      .then((res: AxiosResponse) => {
        if (res.statusText != 'OK') {
          throw new Error(
            "Request failed, status: " +
            res.status +
            " " +
            res.statusText
          );
        }
        return res.data;
      })
      .then(processJson)
      .then((data) => {
        setData(data)
      })
      .catch((err) => {
        setError(err.message);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [url, trigger]);

  return { data, loading, error, refetch };
}

// I think this can be removed
export const useSetStrip = (
  url: string,
  processJson: (data: fetchStripResponse) => any = defaultProcessJson,
): fetchState => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [trigger, setTrigger] = useState(false);
  const [data, setData] = useState<any>(undefined);

  const refetch = () => setTrigger(!trigger);

  const updateStrip = (newState: StripState): void => {
    console.log('setting state to: ', newState)
    setLoading(true);
    axios.post(url, newState)
      .then((res: AxiosResponse) => {
        if (res.statusText != 'OK') {
          throw new Error(
            "Request failed, status: " +
            res.status +
            " " +
            res.statusText
          );
        }
        return res.data;
      })
      .then(processJson)
      .then(setData)
      .catch((err) => {
        setError(err.message);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return { updateStrip, data, loading, error };
}

// I think this can be removed
export const useGetStrip = (url: string): StripData => {
  const [uiOn, setUiOn] = useState<bool>(false);
  const processData = (data: fetchStripResponse): StripState => {
    const { r, g, b } = data.color;
    const color = { r: parseInt(r), g: parseInt(g), b: parseInt(b) };
    const brightness = Math.round((parseInt(data.brightness) * 10) / 255);
    const on = data.on;
    setUiOn(on);
    console.log('data from fetch', { color, brightness, on })
    return { color, brightness, on };
  }
  const setLed = async (url: string) => {
    const payload = {
      on: !state?.on,
      color: [state?.color?.r, state?.color?.g, state?.color?.b],
      brightness: Math.round((state?.brightness * 255) / 10),
    };
    try {
      const response: Response = await fetch(`http://${host}:${port}/${ledStrip.name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(
          "Request failed, status: " +
          response.status +
          " " +
          response.statusText
        );
      }
      const responseBody = await response.json();
      console.log("response from toggle request", responseBody);
      refetch();
    } catch (err) {
      console.error(err);
    }
  }
  const { data, loading, error, refetch } = useFetch(url, processData);
  return { state: data, setLed, loading, error, refetch };
}

interface Color {
  r: number;
  g: number;
  b: number;
}

interface LedStripState {
  on: bool;
  brightness: number;
  color: Color;
}

export const useLedStripHooks = (url: string): StripData => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [trigger, setTrigger] = useState(0);
  const [data, setData] = useState<any>(undefined);
  // function to update the strip with an object
  const update = (newState: Partial<LedStripState>) => {
    console.log('updating state: ', newState);
    setLoading(true);
    axios.post(url, newState)
      .then((res: AxiosResponse) => {
        if (res.statusText != 'OK') {
          throw new Error(
            "Request failed, status: " +
            res.status +
            " " +
            res.statusText
          );
        }
        return res.data;
      })
      .then(setData)
      .catch((err) => {
        setError(err.message);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  // function to refetch the data from the server
  const refetch = () => {
    setTrigger((oldVal) => oldVal + 1)
  }
  // effect that refreshes the data
  useEffect(() => {
    setLoading(true);
    axios.get(url)
      .then((res: AxiosResponse) => {
        if (res.statusText != 'OK') {
          throw new Error(
            "Request failed, status: " +
            res.status +
            " " +
            res.statusText
          );
        }
        return res.data;
      })
      .then((data) => {
        setData(data)
      })
      .catch((err) => {
        setError(err.message);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [url, trigger]);
  return {
    state: { data, loading, error },
    api: { refetch, update }
  }
}


export const useAllStrips = (url: string): AllDevicesData => {
  const { data, loading, error, refetch } = useFetch(url);
  return { devices: data, loading, error, refetch };
}

