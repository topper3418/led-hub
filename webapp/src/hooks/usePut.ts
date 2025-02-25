import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useState } from "react";
import { getLogger } from "../logging";

const logger = getLogger('hooks/post')

export const usePut = <I, O>(
  url: string,
  config?: AxiosRequestConfig
) => {
  const [data, setData] = useState<O | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const put = (data: { data: I }) => {
    logger.debugp(`putting to ${url}`, config)
    setLoading(true);
    axios.put(url, data, config)
      .then((res: AxiosResponse) => {
        if (res.status !== 200) {
          throw new Error(
            `Put to ${url} failed, status: ` +
            res.status +
            " " +
            res.statusText
          );
        }
        return res.data;
      })
      .then((data) => {
        setData(data.data)
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
    api: { put }
  };
}
