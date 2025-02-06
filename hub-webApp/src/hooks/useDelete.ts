import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useState } from "react";

export const useDelete = <T>(
  url: string,
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const del = (config: AxiosRequestConfig) => {
    setLoading(true);
    axios.delete(url, config)
      .then((res: AxiosResponse) => {
        if (res.statusText != 'OK') {
          throw new Error(
            `Delete to ${url} failed, status: ` +
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
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return {
    state: { data, loading, error },
    api: { del }
  };
}
