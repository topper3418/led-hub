import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useState } from "react";

export const useFetch = <T>(
  url: string,
  config?: AxiosRequestConfig,
  extract?: string[]
) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [trigger, setTrigger] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const refetch = () => setTrigger(!trigger);

  useEffect(() => {
    setLoading(true);
    axios.get(url, config)
      .then((res: AxiosResponse) => {
        if (res.statusText != 'OK') {
          throw new Error(
            `Request to ${url} failed, status: ` +
            res.status +
            " " +
            res.statusText
          );
        }
        return res.data;
      })
      .then((data) => {
        setData(data?.data)
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [url, trigger]);

  return {
    state: { data, loading, error },
    api: { refetch }
  };
}


