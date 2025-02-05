import { useEffect, useState } from "react";
import { BACKEND_ROOT_URL } from "../../config";
import { getLogger } from "../../logging";
import { Device } from "../../types";
import axios, { AxiosResponse } from "axios";

const logger = getLogger('views/devices/hooks');

export interface AllLedStripQueryHook {
    state: {
        data: Device[];
        loading: boolean;
        error: string | undefined;
    };
    api: {
        refetch: () => void;
    }
}

export const useAllLedStrips = (
    url: string
): AllLedStripQueryHook => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [trigger, setTrigger] = useState(false);
    const [data, setData] = useState<any>(undefined);

    const refetch = () => setTrigger(!trigger);

    useEffect(() => {
        setLoading(true);
        logger.debug('fetching data from: ', url);
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
                logger.debug('got data:', data)
                setData(data)
            })
            .catch((err) => {
                setError(err.message);
                logger.errorp(err);
            })
            .finally(() => {
                setLoading(false);
                // set timeout to refetch data every 5 seconds
            });
        const interval = setInterval(() => {
            refetch();
        }, 5000);
        return () => clearInterval(interval);
    }, [url, trigger]);

    return {
        state: { data, loading, error },
        api: { refetch }
    };
}

interface SetAllHook {
    state: {
        data: Device[];
        loading: boolean;
        error: string | undefined;
    };
    api: {
        setAll: (newState: boolean) => void;
    }
}

export const useSetAll = (url: string) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [data, setData] = useState<any>(undefined);

    const setAll = (newState: boolean) => {
        setLoading(true);
        axios.post(url, { on: newState })
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
                logger.debug('got data:', data)
                setData(data)
            })
            .catch((err) => {
                setError(err.message);
                logger.errorp(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }
    return {
        state: { data, loading, error },
        api: { setAll }
    };
}
