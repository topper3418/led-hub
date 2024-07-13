import { useState, useEffect } from "react";
import { Color, StripData, AllDevicesData, fetchState, StripState, fetchStripResponse } from "../types";

// base hook for fetching data. should probably refactor to a util module later
const useFetch = (url: string, processJson: () => fetchState): Object => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [trigger, setTrigger] = useState(false);
  const [data, setData] = useState<Array | Object | undefined>(undefined);

  const refetch = () => setTrigger(!trigger);

  useEffect(() => {
    setLoading(true);
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
      .then(processJson)
      .then(setData)
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

export const useStripData = (url: string): StripData => {
  const processData = (data: fetchStripResponse): StripState => {
    const [r, g, b] = data.color;
    const color = { r: parseInt(r), g: parseInt(g), b: parseInt(b) };
    const brightness = Math.round((parseInt(data.brightness) * 10) / 255));
    const on = data.on;
    return { color, brightness, on };
  }
  const { data, loading, error, refetch } = useFetch(url, processData);
  return { state: data, loading, error, refetch };

  export const useStripData = (url: string): StripData => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [color, setColor] = useState<Color>({ r: 0, g: 0, b: 0 });
    const [on, setOn] = useState(false);
    const [brightness, setBrightness] = useState(0);
    const [trigger, setTrigger] = useState(false);

    const refetch = () => setTrigger(!trigger);

    useEffect(() => {
      console.log("loading data");
      setLoading(true);
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
          setColor({ r: parseInt(r), g: parseInt(g), b: parseInt(b) });
          setOn(data.on);
          setBrightness(Math.round((data.brightness * 10) / 255));
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
      loading,
      error,
      state: { color, on, brightness },
      refetch,
    };
  };


  export const useAllStrips = (url: string): AllDevicesData => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [color, setColor] = useState<Color>({ r: 0, g: 0, b: 0 });
    const [on, setOn] = useState(false);
    const [brightness, setBrightness] = useState(0);
    const [trigger, setTrigger] = useState(false);

    const refetch = () => setTrigger(!trigger);

    useEffect(() => {
      console.log("loading data");
      setLoading(true);
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
          setColor({ r: parseInt(r), g: parseInt(g), b: parseInt(b) });
          setOn(data.on);
          setBrightness(Math.round((data.brightness * 10) / 255));
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
      loading,
      error,
      state: { color, on, brightness },
      refetch,
    };
  };
