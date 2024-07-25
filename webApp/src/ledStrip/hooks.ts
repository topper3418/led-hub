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


export const usePost = (
  url: string,
  processJson: (data: fetchStripResponse) => any = defaultProcessJson,
): fetchState => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [trigger, setTrigger] = useState(false);
  const [data, setData] = useState<any>(undefined);

  const refetch = () => setTrigger(!trigger);

  const updateStrip = (newState: StripState): void => {
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

export const useStripData = (url: string): StripData => {
  const processData = (data: fetchStripResponse): StripState => {
    const [r, g, b] = data.color;
    const color = { r: parseInt(r), g: parseInt(g), b: parseInt(b) };
    const brightness = Math.round((parseInt(data.brightness) * 10) / 255);
    const on = data.on;
    return { color, brightness, on };
  }
  const { data, loading, error, refetch } = useFetch(url, processData);
  return { state: data, loading, error, refetch };
}


export const useAllStrips = (url: string): AllDevicesData => {
  const { data, loading, error, refetch } = useFetch(url);
  return { devices: data, loading, error, refetch };
}

