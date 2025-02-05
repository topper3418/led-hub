import { useEffect, useState } from "react";
import { Device } from "../../types";
import { getLogger } from "../../logging";
import axios, { AxiosResponse } from "axios";

const logger = getLogger('ledController/hooks');

export interface Color {
    r: number;
    g: number;
    b: number;
}

interface LedStripState {
    on: boolean;
    brightness: number;
    color: Color;
}

interface StripData {
    state: {
        data?: Device;
        loading: boolean;
        error: string | undefined;
    };
    api: {
        update: (newState: Partial<LedStripState>) => void;
        refetch: () => void;
        delete: () => void;
    }
}

export const useLedStripHooks = (url: string): StripData => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [trigger, setTrigger] = useState(0);
    const [data, setData] = useState<Device | undefined>(undefined);
    // function to update the strip with an object
    const update = (newState: Partial<LedStripState>) => {
        logger.infop('updating state: ', newState);
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
                logger.errorp("Error updating device", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }
    // function to delete the strip
    const destroy = () => {
        logger.infop('deleting device')
        setLoading(true);
        axios.delete(url)
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
                logger.errorp("error deleting device", err);
            })
            .finally(() => {
                setLoading(false);
            })
    }
    // function to refetch the data from the server
    const refetch = () => {
        setTrigger((oldVal) => oldVal + 1)
    }
    // effect that refreshes the data
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
                setData(data)
            })
            .catch((err) => {
                setError(err.message);
                logger.errorp("Error refreshing device data", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [url, trigger]);
    return {
        state: { data, loading, error },
        api: { refetch, update, delete: destroy }
    }
}
