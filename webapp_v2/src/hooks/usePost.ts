import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useState } from "react";
import { getLogger } from "../logging";

const logger = getLogger('hooks/post')

export const usePost = <T>(
  url: string,
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const post = (config: AxiosRequestConfig) => {
    logger.debugp(`posting to ${url}`, config)
    setLoading(true);
    axios.post(url, config)
      .then((res: AxiosResponse) => {
        if (res.statusText != 'OK') {
          throw new Error(
            `Post to ${url} failed, status: ` +
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
    api: { post }
  };
}
