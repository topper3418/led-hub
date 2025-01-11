import { useState, useEffect } from "react";
import { StripData, AllStripData } from "../types";
import axios, { AxiosResponse } from 'axios';

// const defaultProcessJson = (data: fetchStripResponse) => data;

// base hook for fetching data. should probably refactor to a util module later
export const useAllStrips = (
  url: string
): AllStripData => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [trigger, setTrigger] = useState(false);
  const [data, setData] = useState<any>(undefined);

  const refetch = () => setTrigger(!trigger);

  useEffect(() => {
    setLoading(true);
    console.log('fetching data from: ', url);
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
        console.log('got data:', data)
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
    state: { devices: data, loading, error },
    api: { refetch }
  };
}

interface Color {
  r: number;
  g: number;
  b: number;
}

interface LedStripState {
  on: boolean;
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
    state: { devices: data, loading, error },
    api: { refetch, update }
  }
}
