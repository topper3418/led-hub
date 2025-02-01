import { useEffect, useState } from "react";
import { getLogger } from "../../logging";
import axios, { AxiosResponse } from "axios";
import { LOGGING_SERVICE_ENDPOINT } from "../../config";

const logger = getLogger("views/logView/loggerHooks");

export interface Logger {
    id: number;
    name: string;
    level: string;
}

export interface LoggersApi {
    data: Logger[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useFetchLoggers = (): LoggersApi => {
    const [logs, setLogs] = useState<Logger[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [trigger, setTrigger] = useState<boolean>(false);
    useEffect(() => {
        const endpoint = `${LOGGING_SERVICE_ENDPOINT}/loggers`;
        logger.debug(`fetching loggers from ${endpoint}`);
        setLoading(true);
        axios.get(endpoint)
            .then((res: AxiosResponse) => {
                if (res.statusText != "OK") {
                    throw new Error(
                        "Loggers request failed, status: " +
                        res.status +
                        " " +
                        res.statusText
                    );
                }
                return res.data;
            })
            .then((data) => {
                logger.debugp("got loggers:", data);
                setLogs(data);
            })
            .catch((err) => {
                setError(err.message);
                logger.errorp("error fetching logs", err);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [trigger]);

    return {
        data: logs,
        loading,
        error,
        refetch: () => setTrigger(!trigger)
    };
}

export interface SetLoggerLevelApi {
    data: string | null;
    loading: boolean;
    error: string | null;
}

export type SetLoggerLevel = (loggerId: number, level: string) => void;

export const useSetLoggerLevel = (): [SetLoggerLevel, SetLoggerLevelApi] => {
    const [data, setData] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const setLoggerLevel: SetLoggerLevel = (loggerId, level) => {
        const endpoint = `${LOGGING_SERVICE_ENDPOINT}/loggers`;
        logger.debug(`setting logger level for logger ${loggerId} to ${level}`);
        setLoading(true);
        axios.put(endpoint, { id: loggerId, level })
            .then((res: AxiosResponse) => {
                if (res.statusText != "OK") {
                    throw new Error(
                        "Loggers request failed, status: " +
                        res.status +
                        " " +
                        res.statusText
                    );
                }
                return res.data;
            })
            .then((data) => {
                logger.debug("got data:", data);
                setData(data);
            })
            .catch((err) => {
                setError(err.message);
                logger.errorp("error setting logger level", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }
    return [setLoggerLevel, { data, loading, error }];
}
