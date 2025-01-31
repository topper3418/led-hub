import React, { CSSProperties, useEffect, useState } from "react"
import Banner from "../components/banner";
import { useNavigate } from "react-router-dom";
import { getLogger } from "../logging";
import { LOGGING_SERVICE_ENDPOINT } from "../config";
import axios, { AxiosResponse } from "axios";
import { formatDateString } from "../util";

const logger = getLogger("views/logView");

const LogView: React.FC = () => {
    const navigate = useNavigate();
    const [minTime, setMinTime] = useState<string>("");
    const [maxTime, setMaxTime] = useState<string>("");
    const [offset, setOffset] = useState<number>(0);
    const [limit, setLimit] = useState<number>(100);
    const [includeLoggers, setIncludeLoggers] = useState<string[]>([]);
    const [excludeLoggers, setExcludeLoggers] = useState<string[]>([]);
    const [search, setSearch] = useState<string>(" ");

    const logs = useFetchLogs({
        minTime,
        maxTime,
        offset,
        limit,
        includeLoggers,
        excludeLoggers,
        search
    })
    const BackButton = () => <button onClick={() => navigate("/")}>Back</button>;

    const tableWrapperStyle = {
        flex: "0 0 800px",
        overflowY: "auto",
    } as CSSProperties;

    return (
        <div className="wrapper view column gapped">
            <Banner title="Log View">
                <BackButton />
            </Banner>
            <div className="row gapped">
                <label>
                    Min Time:
                    <input
                        type="datetime-local"
                        value={minTime}
                        onChange={(e) => setMinTime(e.target.value)}
                    />
                </label>
                <label>
                    Max Time:
                    <input
                        type="datetime-local"
                        value={maxTime}
                        onChange={(e) => setMaxTime(e.target.value)}
                    />
                </label>
                <label>
                    Offset:
                    <input
                        type="number"
                        value={offset}
                        onChange={(e) => setOffset(parseInt(e.target.value))}
                    />
                </label>
                <label>
                    Limit:
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                    />
                </label>
                <label>
                    Include Loggers:
                    <input
                        type="text"
                        value={includeLoggers.join(",")}
                        onChange={(e) => setIncludeLoggers(e.target.value.split(","))}
                    />
                </label>
                <label>
                    Exclude Loggers:
                    <input
                        type="text"
                        value={excludeLoggers.join(",")}
                        onChange={(e) => setExcludeLoggers(e.target.value.split(","))}
                    />
                </label>
                <label>
                    Search:
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>
                <button onClick={() => logs.refetch()}>Refresh</button>
            </div>
            <div className="row flex">
                <div className="column flex" style={tableWrapperStyle}>
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Logger</th>
                                <th>Level</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.loading ? (
                                <tr><td colSpan={4}>Loading...</td></tr>
                            ) : logs.error ? (
                                <tr><td colSpan={4}>Error: {logs.error}</td></tr>
                            ) : logs.data && logs.data.length > 0 ? (
                                logs.data?.map((log) => (
                                    <tr key={log.id}>
                                        <td>{formatDateString(log.timestamp)}</td>
                                        <td>{log.logger}</td>
                                        <td>{log.level}</td>
                                        <td>{log.message}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4}>No logs to display</td></tr>

                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

interface LogQueryParams {
    minTime: string;
    maxTime: string;
    offset: number;
    limit: number;
    includeLoggers: string[];
    excludeLoggers: string[];
    search: string;
}

interface LogEntry {
    id: number;
    timestamp: string;
    logger: string;
    loggerId: number;
    level: string;
    message: string;
    meta: any;
}

const useFetchLogs = (params: LogQueryParams) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [trigger, setTrigger] = useState<boolean>(false);
    useEffect(() => {
        logger.debug(`fetching logs from ${LOGGING_SERVICE_ENDPOINT}`, params);
        setLoading(true);
        axios.get(LOGGING_SERVICE_ENDPOINT, { params })
            .then((res: AxiosResponse) => {
                if (res.statusText != "OK") {
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
                logger.debug("got data:", data);
                setLogs(data);
            })
            .catch((err) => {
                setError(err.message);
                logger.errorp("error fetching logs", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [trigger])
    return { data: logs, loading, error, refetch: () => setTrigger(!trigger) };
}

export default LogView;
