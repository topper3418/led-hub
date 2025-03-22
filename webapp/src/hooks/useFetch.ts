import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useState } from "react";

import { getLogger } from "../logging";

const logger = getLogger("hooks/useFetch");

export const useFetch = <T>(
  url: string,
  config?: AxiosRequestConfig,
  extract?: string
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [trigger, setTrigger] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const refetch = () => setTrigger(!trigger);

  useEffect(() => {
    setLoading(true);
    logger.debug(`fetching data from url: ${url}`)
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
        logger.debug(`got data from url: ${url}`, { data });
        setData(extract ? data?.data?.[extract] : data?.data);
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


